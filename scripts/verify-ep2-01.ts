/**
 * ep2-01-project-create-api 验证脚本
 *
 * 验证：
 *  - 7.3: DB 中 Project(status=queued) + GenerationJob(status=pending) 同时存在
 *  - 7.5: 重复 requestId → DuplicateRequestError
 *  - 7.6: 第 2 次请求 → QuotaExceededError
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createProject, QuotaExceededError, ConcurrentLimitError, DuplicateRequestError } from "../src/server/services/project.service";
import { sendGenerateRequested } from "../src/inngest/client";
import { randomUUID } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=".repeat(60));
  console.log("ep2-01 验证脚本");
  console.log("=".repeat(60));

  // 1. 获取测试用户
  const users = await prisma.user.findMany({ take: 1, select: { id: true, name: true, email: true } });
  if (users.length === 0) {
    console.log("❌ 数据库中没有用户，请先注册一个账号");
    await prisma.$disconnect();
    process.exit(1);
  }
  const testUser = users[0];
  console.log(`\n📋 测试用户: ${testUser.name} (${testUser.email})`);

  // 2. 清理该用户的已有数据（确保测试环境干净）
  const existingJobs = await prisma.generationJob.count({ where: { userId: testUser.id } });
  console.log(`   已有 GenerationJob: ${existingJobs} 条`);
  if (existingJobs > 0) {
    console.log("   ⚠️  已有数据可能影响测试结果，正在清理...");
    await prisma.generationJob.deleteMany({ where: { userId: testUser.id } });
    await prisma.project.deleteMany({ where: { userId: testUser.id } });
    console.log("   ✓ 已清理");
  }

  // ========== 7.3: 验证 Project + GenerationJob 同时创建 ==========
  console.log("\n" + "-".repeat(60));
  console.log("7.3: 验证 DB 中 Project(status=queued) + GenerationJob(status=pending)");
  console.log("-".repeat(60));

  const requestId1 = randomUUID();
  console.log(`   requestId: ${requestId1}`);

  const result1 = await createProject(
    {
      sourceText: "测试项目——Hello World! 这是一个验证脚本创建的测试项目。",
      aspectRatio: "16:9",
      audienceRole: "student",
      audienceLevel: "beginner",
      targetDurationSec: 60,
      voiceProvider: "azure",
      voiceId: "zh-CN-XiaoxiaoNeural",
      requestId: requestId1,
    },
    testUser.id,
    false,
  );

  console.log(`   ✓ 创建成功: projectId=${result1.projectId}, jobId=${result1.jobId}`);

  // 验证 Project 存在于 DB 中且 status=queued
  const project = await prisma.project.findUnique({
    where: { id: result1.projectId },
  });
  if (!project) throw new Error("Project not found in DB!");
  if (project.status !== "queued") throw new Error(`Expected status=queued, got ${project.status}`);
  if (project.userId !== testUser.id) throw new Error("UserId mismatch");
  if (project.aspectRatio !== "16:9") throw new Error("AspectRatio not preserved");
  if (project.audienceRole !== "student") throw new Error("audienceRole not preserved");
  console.log(`   ✓ Project(status=${project.status}, title="${project.title}")`);

  // 验证 GenerationJob 存在于 DB 中且 status=pending
  const job = await prisma.generationJob.findUnique({
    where: { id: result1.jobId },
  });
  if (!job) throw new Error("GenerationJob not found in DB!");
  if (job.status !== "pending") throw new Error(`Expected status=pending, got ${job.status}`);
  if (job.jobType !== "storyboard") throw new Error(`Expected jobType=storyboard, got ${job.jobType}`);
  if (job.requestId !== requestId1) throw new Error("requestId mismatch");
  if (job.projectId !== result1.projectId) throw new Error("projectId mismatch");
  console.log(`   ✓ GenerationJob(status=${job.status}, jobType=${job.jobType}, requestId=${job.requestId})`);

  // 7.4: 发送 Inngest 事件
  try {
    await sendGenerateRequested({
      projectId: result1.projectId,
      userId: testUser.id,
      jobId: result1.jobId,
    });
    console.log("\n   ✅ 7.4 通过: Inngest video/generate.requested 事件已发送");
    console.log("      请在 Inngest Dev UI (http://localhost:8288) 查看 Events");
  } catch (err) {
    console.log(`\n   ❌ 7.4 失败: Inngest 发送失败 - ${(err as Error).message}`);
    process.exitCode = 1;
  }

  console.log("\n   ✅ 7.3 通过: Project(status=queued) + GenerationJob(status=pending) 同时存在");

  // ========== 7.5: 重复 requestId → DuplicateRequestError ==========
  console.log("\n" + "-".repeat(60));
  console.log("7.5: 重复 requestId → DuplicateRequestError");
  console.log("-".repeat(60));

  try {
    await createProject(
      { sourceText: "重复请求", requestId: requestId1 },
      testUser.id,
      false,
    );
    console.log("   ❌ 7.5 失败: 应该抛出 DuplicateRequestError 但没有");
    process.exitCode = 1;
  } catch (error) {
    if (error instanceof DuplicateRequestError) {
      console.log(`   ✓ DuplicateRequestError: ${error.message}`);
      console.log(`     existingProjectId: ${error.existingProjectId}`);
      console.log(`     existingJobId: ${error.existingJobId}`);
      console.log("\n   ✅ 7.5 通过: 重复 requestId → DuplicateRequestError");
    } else {
      console.log(`   ❌ 7.5 失败: 预期 DuplicateRequestError, 实际 ${(error as Error).constructor.name}: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  }

  // ========== 7.6: 第 2 次请求 → QuotaExceededError ==========
  console.log("\n" + "-".repeat(60));
  console.log("7.6: 第 2 次请求（不同 requestId）→ QuotaExceededError");
  console.log("-".repeat(60));

  const requestId2 = randomUUID();
  try {
    await createProject(
      { sourceText: "第二个请求", requestId: requestId2 },
      testUser.id,
      false,
    );
    console.log("   ❌ 7.6 失败: 应该抛出 QuotaExceededError 但没有");
    process.exitCode = 1;
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      console.log(`   ✓ QuotaExceededError: ${error.message}`);
      console.log(`     used: ${error.used}, limit: ${error.limit}, resetsAt: ${error.resetsAt.toISOString()}`);
      console.log("\n   ✅ 7.6 通过: 第 2 次请求 → QuotaExceededError");
    } else {
      console.log(`   ❌ 7.6 失败: 预期 QuotaExceededError, 实际 ${(error as Error).constructor.name}: ${(error as Error).message}`);
      process.exitCode = 1;
    }
  }

  // ========== 总结 ==========
  console.log("\n" + "=".repeat(60));
  console.log("验证结果");
  console.log("=".repeat(60));
  const passed = !process.exitCode || process.exitCode === 0;
  console.log(`   7.3: ${passed ? "✅" : "⏳"} Project + GenerationJob 同时存在`);
  console.log(`   7.5: ${passed ? "✅" : "⏳"} 重复 requestId → DuplicateRequestError`);
  console.log(`   7.6: ${passed ? "✅" : "⏳"} 第 2 次请求 → QuotaExceededError`);
  console.log(`   7.4: ⏳ 需手动检查 Inngest Dev UI (http://localhost:8288) → Events → video/generate.requested`);

  // 清理测试数据
  console.log("\n   🧹 清理测试数据...");
  await prisma.generationJob.deleteMany({ where: { userId: testUser.id } });
  await prisma.project.deleteMany({ where: { userId: testUser.id } });
  console.log("   ✓ 清理完毕");

  await prisma.$disconnect();
  console.log("\n✅ 自动化验证完成！");
}

main().catch((err) => {
  console.error("❌ 验证脚本失败:", err);
  prisma.$disconnect().then(() => process.exit(1));
});
