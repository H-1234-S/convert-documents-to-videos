import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/generated/prisma/client";

// ---- Prisma Select Constants ----

/** 列表查询字段选择：返回 Dashboard 卡片所需的最小字段集 */
export const LIST_SELECT = {
  id: true,
  title: true,
  status: true,
  aspectRatio: true,
  targetDurationSec: true,
  createdAt: true,
  updatedAt: true,
  generationJobs: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      jobType: true,
      status: true,
    },
  },
} satisfies Prisma.ProjectSelect;

/** 详情查询字段选择：返回项目详情页所需的全部字段 */
export const DETAIL_SELECT = {
  id: true,
  userId: true, // ← 权限校验必需，不返回给前端
  title: true,
  sourceText: true,
  status: true,
  audienceRole: true,
  audienceLevel: true,
  aspectRatio: true,
  targetDurationSec: true,
  voiceProvider: true,
  voiceId: true,
  errorCode: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
  generationJobs: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      jobType: true,
      status: true,
      aiProvider: true,
      aiModel: true,
      errorCode: true,
      errorMessage: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
  },
  currentStoryboardVersion: {
    select: {
      id: true,
      versionNumber: true,
      totalDurationSec: true,
      scenes: {
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          order: true,
          narrationText: true,
          visualDescription: true,
          emotionalTone: true,
          animationPreset: true,
          durationSec: true,
          startTimeSec: true,
          audioAssetId: true,
          imageAssetId: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

// ---- Raw Row Types (inferred from Prisma select) ----

type ListRow = Prisma.ProjectGetPayload<{ select: typeof LIST_SELECT }>;
type DetailRow = Prisma.ProjectGetPayload<{ select: typeof DETAIL_SELECT }>;

// ---- Exported Output Types ----

/** findProjectsPaginated 的选项参数 */
export interface ListProjectsOptions {
  cursor?: string;
  /** 每页条数，默认 12，最大 50 */
  pageSize?: number;
  /** 按 project.status 筛选 */
  status?: string;
}

/** 列表中的单个项目 */
export interface ProjectListItem {
  id: string;
  title: string;
  status: string;
  aspectRatio: string;
  targetDurationSec: number | null;
  createdAt: Date;
  updatedAt: Date;
  currentJob: {
    id: string;
    jobType: string;
    status: string;
  } | null;
}

/** 分页列表结果 */
export interface ProjectListResult {
  items: ProjectListItem[];
  nextCursor: string | null;
  total: number;
}

/** 详情中的 GenerationJob */
export interface ProjectDetailJob {
  id: string;
  jobType: string;
  status: string;
  aiProvider: string;
  aiModel: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

/** 详情中的 Scene */
export interface ProjectDetailScene {
  id: string;
  order: number;
  narrationText: string;
  visualDescription: string;
  emotionalTone: string | null;
  animationPreset: string | null;
  durationSec: number | null;
  startTimeSec: number | null;
  audioAssetId: string | null;
  imageAssetId: string | null;
}

/** 详情中的 StoryboardVersion */
export interface ProjectDetailStoryboard {
  id: string;
  versionNumber: number;
  totalDurationSec: number | null;
  scenes: ProjectDetailScene[];
}

/** 项目完整详情 */
export interface ProjectDetailResult {
  id: string;
  userId: string; // ← 仅服务端权限判断使用，不返回给前端
  title: string;
  sourceText: string;
  status: string;
  audienceRole: string | null;
  audienceLevel: string | null;
  aspectRatio: string;
  targetDurationSec: number | null;
  voiceProvider: string | null;
  voiceId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentJob: ProjectDetailJob | null;
  currentStoryboardVersion: ProjectDetailStoryboard | null;
}

// ---- Transformation Helpers ----

/** 将 Prisma 原始行转换为 ProjectListItem */
function toListItem(row: ListRow): ProjectListItem {
  const job = row.generationJobs[0] ?? null;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    aspectRatio: row.aspectRatio,
    targetDurationSec: row.targetDurationSec,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    currentJob: job
      ? { id: job.id, jobType: job.jobType, status: job.status }
      : null,
  };
}

/** 将 Prisma 原始行转换为 ProjectDetailResult */
function toDetailResult(row: DetailRow): ProjectDetailResult {
  const job = row.generationJobs[0] ?? null;
  const storyboard = row.currentStoryboardVersion ?? null;

  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    sourceText: row.sourceText,
    status: row.status,
    audienceRole: row.audienceRole,
    audienceLevel: row.audienceLevel,
    aspectRatio: row.aspectRatio,
    targetDurationSec: row.targetDurationSec,
    voiceProvider: row.voiceProvider,
    voiceId: row.voiceId,
    errorCode: row.errorCode,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    currentJob: job
      ? {
          id: job.id,
          jobType: job.jobType,
          status: job.status,
          aiProvider: job.aiProvider,
          aiModel: job.aiModel,
          errorCode: job.errorCode,
          errorMessage: job.errorMessage,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          createdAt: job.createdAt,
        }
      : null,
    currentStoryboardVersion: storyboard
      ? {
          id: storyboard.id,
          versionNumber: storyboard.versionNumber,
          totalDurationSec: storyboard.totalDurationSec,
          scenes: storyboard.scenes.map((s) => ({
            id: s.id,
            order: s.order,
            narrationText: s.narrationText,
            visualDescription: s.visualDescription,
            emotionalTone: s.emotionalTone,
            animationPreset: s.animationPreset,
            durationSec: s.durationSec,
            startTimeSec: s.startTimeSec,
            audioAssetId: s.audioAssetId,
            imageAssetId: s.imageAssetId,
          })),
        }
      : null,
  };
}

// ---- Query Functions ----

/** 默认 pageSize */
const DEFAULT_PAGE_SIZE = 12;
/** 最大 pageSize */
const MAX_PAGE_SIZE = 50;

/**
 * 查询用户的项目列表（cursor-based 分页 + 按 status 筛选）。
 *
 * 使用 `Promise.all` 并行执行 findMany 和 count 以减少延迟。
 * 多取一条记录判断 `hasMore`，通过 `id` 游标实现稳定分页。
 *
 * @param userId - 当前用户 ID
 * @param options - 分页和筛选选项
 * @returns ProjectListResult
 */
export async function findProjectsPaginated(
  userId: string,
  options: ListProjectsOptions = {},
): Promise<ProjectListResult> {
  const pageSize = Math.min(
    Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const { cursor, status } = options;

  const where = {
    userId,
    ...(status ? { status } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1, // 多取一条判断 hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: LIST_SELECT,
    }),
    prisma.project.count({ where }),
  ]);

  const hasMore = rows.length > pageSize;
  const items = (hasMore ? rows.slice(0, pageSize) : rows).map(toListItem);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    total,
  };
}

/**
 * 按 projectId 查询项目完整详情。
 *
 * 包含：最近一次 GenerationJob + 当前 StoryboardVersion（含 Scene 列表）。
 * 不存在时返回 null。
 *
 * @param projectId - 项目 ID
 * @returns ProjectDetailResult | null
 */
export async function findProjectDetailById(
  projectId: string,
): Promise<ProjectDetailResult | null> {
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: DETAIL_SELECT,
  });

  if (!row) return null;

  return toDetailResult(row);
}
