import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import {
  createProject,
  QuotaExceededError,
  ConcurrentLimitError,
  DuplicateRequestError,
} from "../services/project.service";
import { sendGenerateRequested } from "@/inngest/client";

// ---- Zod Schemas ----

/** 支持的长宽比枚举 */
const ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;

/** createAndGenerate 输入校验 */
export const createProjectInputSchema = z.object({
  sourceText: z
    .string()
    .min(1, "文本内容不能为空")
    .max(5000, "文本内容不能超过 5000 字符"),
  aspectRatio: z.enum(ASPECT_RATIOS).optional(),
  audienceRole: z.string().max(50).optional(),
  audienceLevel: z.string().max(50).optional(),
  targetDurationSec: z.number().int().positive().max(3600).optional(),
  voiceProvider: z.string().max(50).optional(),
  voiceId: z.string().max(100).optional(),
  requestId: z.string().uuid("requestId 必须是有效的 UUID"),
});

/** CreateProjectInput 类型 */
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// ---- Router ----

export const projectRouter = router({
  /**
   * 用户提交文本创建视频生成项目。
   *
   * 流程：advisory lock → 额度检查 → 并发检查 → 创建 Project+GenerationJob → 发送 Inngest 事件。
   * 返回 `{ projectId, jobId }`。
   */
  createAndGenerate: protectedProcedure
    .input(createProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createProject(
          input,
          ctx.userId,
          ctx.isAdmin,
        );

        // 事务成功后发送 Inngest 事件（失败不阻塞响应）
        try {
          await sendGenerateRequested({
            projectId: result.projectId,
            userId: ctx.userId,
            jobId: result.jobId,
          });
        } catch (sendError) {
          console.error(
            "[Inngest] 发送 video/generate.requested 事件失败",
            sendError,
          );
        }

        return result;
      } catch (error) {
        // 错误映射：业务错误 → TRPCError
        if (error instanceof QuotaExceededError) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `[QUOTA_EXCEEDED] ${error.message} | resetsAt=${error.resetsAt.toISOString()}`,
          });
        }

        if (error instanceof ConcurrentLimitError) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `[CONCURRENT_LIMIT] ${error.message} | activeProjectId=${error.activeProjectId}`,
          });
        }

        if (error instanceof DuplicateRequestError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `[DUPLICATE_REQUEST] ${error.message} | existingProjectId=${error.existingProjectId} | existingJobId=${error.existingJobId}`,
          });
        }

        // 未知错误
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),
});
