import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../init";
import {
  createProject,
  QuotaExceededError,
  ConcurrentLimitError,
  DuplicateRequestError,
  listProjects,
  getProjectById,
  deleteProject,
  retryGeneration,
  ProjectNotFoundError,
  ProjectAccessDeniedError,
} from "@/server/services/project.service";
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

// ---- List / GetById Schemas ----

/**
 * Project 的有效状态值，与 `prisma/schema.prisma` 中 Project.status 注释保持同步：
 * queued, generating_storyboard, storyboard_ready, generating_audio,
 * calculating_timeline, rendering, completed, failed, cancelled
 */
const VALID_PROJECT_STATUSES = [
  "queued",
  "generating_storyboard",
  "storyboard_ready",
  "generating_audio",
  "calculating_timeline",
  "rendering",
  "completed",
  "failed",
  "cancelled",
] as const;

/** project.list 分页查询输入 */
export const listProjectsInputSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.number().int().min(1).max(50).default(12),
  status: z.enum(VALID_PROJECT_STATUSES).optional(),
});

/** project.getById 输入 */
export const getProjectByIdInputSchema = z.object({
  // CUID 格式校验：projectId 是 CUID 而非 UUID，不能用 .uuid()
  projectId: z
    .string()
    .min(1, "projectId 不能为空")
    .max(50, "projectId 长度不能超过 50")
    .regex(/^[a-zA-Z0-9_-]+$/, "projectId 格式无效"),
});

/** project.delete 输入 */
export const deleteProjectInputSchema = z.object({
  projectId: z
    .string()
    .min(1, "projectId 不能为空")
    .max(50, "projectId 长度不能超过 50")
    .regex(/^[a-zA-Z0-9_-]+$/, "projectId 格式无效"),
});

/** project.retry 输入 */
export const retryProjectInputSchema = z.object({
  projectId: z
    .string()
    .min(1, "projectId 不能为空")
    .max(50, "projectId 长度不能超过 50")
    .regex(/^[a-zA-Z0-9_-]+$/, "projectId 格式无效"),
});

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

  /**
   * 查询用户的项目列表（cursor-based 分页 + 按 status 筛选）。
   *
   * 仅返回当前用户自己的项目。admin 不特殊——admin 也按 userId 隔离列表。
   */
  list: protectedProcedure
    .input(listProjectsInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await listProjects(ctx.userId, input);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  /**
   * 按 projectId 查询项目完整详情。
   *
   * 权限：owner 或 admin 可查看。
   * 响应中不包含 userId 字段（router 层剔除）。
   */
  getById: protectedProcedure
    .input(getProjectByIdInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        const detail = await getProjectById(
          input.projectId,
          ctx.userId,
          ctx.isAdmin,
        );
        // 剔除 userId，确保不泄露给前端
        const { userId: _unused, ...publicDetail } = detail;
        void _unused;
        return publicDetail;
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `[PROJECT_NOT_FOUND] 项目不存在 | projectId: ${error.projectId}`,
          });
        }

        if (error instanceof ProjectAccessDeniedError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `[PROJECT_ACCESS_DENIED] 无权访问该项目 | projectId: ${error.projectId}`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  /**
   * 软删除项目：将项目状态设为 deleted。
   *
   * 权限：仅 owner 可删除。
   * 返回 { success: true }。
   */
  delete: protectedProcedure
    .input(deleteProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await deleteProject(input.projectId, ctx.userId);
      } catch (error) {
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `[PROJECT_NOT_FOUND] 项目不存在 | projectId: ${error.projectId}`,
          });
        }

        if (error instanceof ProjectAccessDeniedError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `[PROJECT_ACCESS_DENIED] 无权访问该项目 | projectId: ${error.projectId}`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  /**
   * 重试失败/取消的项目生成：重置状态为 queued，创建新 GenerationJob，发送 Inngest 事件。
   *
   * 权限：仅 owner 可重试。
   * 返回 { jobId }。
   */
  retry: protectedProcedure
    .input(retryProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await retryGeneration(input.projectId, ctx.userId);

        // 事务成功后发送 Inngest 事件（失败不阻塞响应）
        try {
          await sendGenerateRequested({
            projectId: input.projectId,
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
        if (error instanceof ProjectNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `[PROJECT_NOT_FOUND] 项目不存在 | projectId: ${error.projectId}`,
          });
        }

        if (error instanceof ProjectAccessDeniedError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `[PROJECT_ACCESS_DENIED] 无权访问该项目 | projectId: ${error.projectId}`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),
});
