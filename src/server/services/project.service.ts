import { Prisma } from "@/generated/prisma/client";
import { checkDailyQuota } from "./quota.service";

// ---- Types ----

/** 创建 Project 的输入参数（service 层，校验已在 Router 层完成） */
export interface CreateProjectInput {
  sourceText: string;
  aspectRatio?: string;
  audienceRole?: string;
  audienceLevel?: string;
  targetDurationSec?: number;
  voiceProvider?: string;
  voiceId?: string;
  requestId: string;
}

/** 创建成功返回值 */
export interface CreateProjectResult {
  projectId: string;
  jobId: string;
}

// ---- Error Classes ----

/** 每日额度超限 */
export class QuotaExceededError extends Error {
  public readonly code = "QUOTA_EXCEEDED";
  constructor(
    message: string,
    public readonly used: number,
    public readonly limit: number,
    public readonly resetsAt: Date,
  ) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

/** 并发活跃项目限制 */
export class ConcurrentLimitError extends Error {
  public readonly code = "CONCURRENT_LIMIT";
  constructor(
    message: string,
    public readonly activeProjectId: string,
  ) {
    super(message);
    this.name = "ConcurrentLimitError";
  }
}

/** 重复请求（幂等冲突） */
export class DuplicateRequestError extends Error {
  public readonly code = "DUPLICATE_REQUEST";
  constructor(
    message: string,
    public readonly existingProjectId: string,
    public readonly existingJobId: string,
  ) {
    super(message);
    this.name = "DuplicateRequestError";
  }
}

// ---- Constants ----

/** 活跃项目状态：这些状态下的 Project 被认为仍在处理中 */
const ACTIVE_STATUSES = [
  "queued",
  "generating_storyboard",
  "storyboard_ready",
  "generating_audio",
  "calculating_timeline",
  "rendering",
] as const;

/** 最大并发活跃项目数 */
const MAX_CONCURRENT_PROJECTS = 1;

// ---- Helpers ----

/**
 * 将 userId 字符串哈希为 bigint，用作 PostgreSQL advisory lock 的锁键。
 *
 * 使用 djb2 变体算法，对 userId（一般为 cuid/ulid）冲突概率极低。
 * PostgreSQL advisory lock 接受 signed 64-bit bigint，Math.abs 的边界情况
 * （-2147483648 仍为负）不影响功能——PG 同样接受负 bigint。
 */
export function hashUserId(userId: string): bigint {
  let hash = BigInt(5381);
  for (let i = 0; i < userId.length; i++) {
    hash =
      ((hash * BigInt(33)) ^ BigInt(userId.charCodeAt(i))) &
      BigInt("0xffffffffffffffff");
  }
  return hash;
}

/**
 * 判断错误是否为 Prisma 唯一约束冲突（P2002）。
 */
export function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError & { code: "P2002" } {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * 解析 P2002 错误中的唯一约束字段名。
 */
function getConstraintField(
  error: Prisma.PrismaClientKnownRequestError,
): string | undefined {
  const target = error.meta?.target as string[] | undefined;
  return target?.[0];
}

/**
 * 从 sourceText 生成 title（前 50 字符 + "..."）。
 */
function generateTitle(sourceText: string): string {
  const trimmed = sourceText.trim();
  if (trimmed.length <= 50) return trimmed;
  return trimmed.slice(0, 50) + "...";
}

// ---- Main Service ----

/**
 * 创建视频生成项目并在同一事务内创建对应的 storyboard GenerationJob。
 *
 * 事务流程：
 * 1. Advisory lock（按 userId 串行化同一用户的并发请求）
 * 2. 额度检查（非 admin 用户）
 * 3. 并发活跃项目检查
 * 4. 创建 Project（status=queued）
 * 5. 创建 GenerationJob（jobType=storyboard, status=pending）
 *
 * 幂等保护：GenerationJob.requestId 有 @unique 约束，P2002 冲突时抛 DuplicateRequestError。
 * 事务级别的 advisory lock 在提交/回滚时自动释放。
 *
 * @param input - 创建参数
 * @param userId - 当前用户 ID
 * @param isAdmin - 是否为 admin（admin 豁免额度检查）
 * @returns CreateProjectResult
 */
export async function createProject(
  input: CreateProjectInput,
  userId: string,
  isAdmin: boolean,
): Promise<CreateProjectResult> {
  const { prisma } = await import("@/lib/db/client");

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Advisory lock：序列化同一用户的并发请求
      const lockId = hashUserId(userId);
      await tx.$executeRawUnsafe(
        `SELECT pg_advisory_xact_lock($1::bigint)`,
        lockId,
      );

      // 2. 幂等检查：同一 requestId 已存在则直接返回（先于额度检查，避免重复消耗额度）
      const existingJob = await tx.generationJob.findUnique({
        where: { requestId: input.requestId },
        select: { id: true, projectId: true },
      });
      if (existingJob) {
        throw new DuplicateRequestError(
          `[DUPLICATE_REQUEST] 该请求已提交过，请勿重复提交`,
          existingJob.projectId,
          existingJob.id,
        );
      }

      // 3. 额度检查（admin 豁免）
      if (!isAdmin) {
        const quota = await checkDailyQuota(tx, userId);
        if (!quota.allowed) {
          throw new QuotaExceededError(
            `[QUOTA_EXCEEDED] 每日免费额度已用完（${quota.used}/${quota.limit}），请明日再试`,
            quota.used,
            quota.limit,
            quota.resetsAt,
          );
        }
      }

      // 4. 并发活跃项目检查
      const activeCount = await tx.project.count({
        where: {
          userId,
          status: { in: [...ACTIVE_STATUSES] },
        },
      });

      if (activeCount >= MAX_CONCURRENT_PROJECTS) {
        const activeProject = await tx.project.findFirst({
          where: { userId, status: { in: [...ACTIVE_STATUSES] } },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        });
        throw new ConcurrentLimitError(
          `[CONCURRENT_LIMIT] 您有一个项目正在处理中，请等待完成后再创建新项目`,
          activeProject?.id ?? "unknown",
        );
      }

      // 5. 创建 Project
      const title = generateTitle(input.sourceText);
      const project = await tx.project.create({
        data: {
          userId,
          title,
          sourceText: input.sourceText,
          aspectRatio: input.aspectRatio ?? "16:9",
          audienceRole: input.audienceRole,
          audienceLevel: input.audienceLevel,
          targetDurationSec: input.targetDurationSec,
          voiceProvider: input.voiceProvider,
          voiceId: input.voiceId,
        },
      });

      // 6. 创建 GenerationJob（带 requestId 幂等键，@unique 约束作最后防线）
      const job = await tx.generationJob.create({
        data: {
          userId,
          projectId: project.id,
          jobType: "storyboard",
          requestId: input.requestId,
          aiProvider: "internal",
          inputParams: JSON.stringify({
            sourceText: input.sourceText,
            aspectRatio: input.aspectRatio ?? "16:9",
            audienceRole: input.audienceRole,
            audienceLevel: input.audienceLevel,
            targetDurationSec: input.targetDurationSec,
            voiceProvider: input.voiceProvider,
            voiceId: input.voiceId,
          }),
        },
      });

      return { projectId: project.id, jobId: job.id };
    });
  } catch (error) {
    // 幂等冲突：catch P2002 → 事务外查询已有 job → throw DuplicateRequestError
    if (
      isUniqueConstraintError(error) &&
      getConstraintField(error) === "requestId"
    ) {
      const existingJob = await prisma.generationJob.findUnique({
        where: { requestId: input.requestId },
        select: { id: true, projectId: true },
      });

      throw new DuplicateRequestError(
        `[DUPLICATE_REQUEST] 该请求已提交过，请勿重复提交`,
        existingJob?.projectId ?? "",
        existingJob?.id ?? "",
      );
    }
    throw error;
  }
}
