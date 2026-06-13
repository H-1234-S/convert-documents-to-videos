import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  findProjectsPaginated,
  findProjectDetailById,
} from "../project.repo";

// ---- Mocks ----

vi.mock("@/lib/db/client", () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/client";

const mockPrisma = prisma as unknown as {
  project: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
};

// ---- Fixtures ----

const TEST_USER_ID = "user-test-123";

const mockDate = new Date("2026-06-13T08:00:00.000Z");

function mockListRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "proj-1",
    title: "Test Project",
    status: "completed",
    aspectRatio: "16:9",
    targetDurationSec: 120,
    createdAt: mockDate,
    updatedAt: mockDate,
    generationJobs: [
      { id: "job-1", jobType: "storyboard", status: "completed" },
    ],
    ...overrides,
  };
}

function mockDetailRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "proj-1",
    userId: TEST_USER_ID,
    title: "Test Project",
    sourceText: "Full source text here...",
    status: "storyboard_ready",
    audienceRole: "student",
    audienceLevel: "intermediate",
    aspectRatio: "16:9",
    targetDurationSec: 120,
    voiceProvider: "minimax",
    voiceId: "male-qn-qingse",
    errorCode: null,
    errorMessage: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    generationJobs: [
      {
        id: "job-1",
        jobType: "storyboard",
        status: "completed",
        aiProvider: "deepseek",
        aiModel: "deepseek-chat",
        errorCode: null,
        errorMessage: null,
        startedAt: mockDate,
        completedAt: mockDate,
        createdAt: mockDate,
      },
    ],
    currentStoryboardVersion: {
      id: "sv-1",
      versionNumber: 1,
      totalDurationSec: 115.5,
      scenes: [
        {
          id: "scene-1",
          order: 1,
          narrationText: "Narration...",
          visualDescription: "Visual...",
          emotionalTone: "neutral",
          animationPreset: "fadeIn",
          durationSec: 15.2,
          startTimeSec: 0,
          audioAssetId: "asset-audio-1",
          imageAssetId: null,
        },
      ],
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---- Tests ----

describe("findProjectsPaginated", () => {
  it("应返回用户的项目列表（按 createdAt desc）", async () => {
    mockPrisma.project.findMany.mockResolvedValue([mockListRow()]);
    mockPrisma.project.count.mockResolvedValue(1);

    const result = await findProjectsPaginated(TEST_USER_ID);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("proj-1");
    expect(result.items[0].title).toBe("Test Project");
  });

  it("首页应正确返回 items + nextCursor + total", async () => {
    const rows = Array.from({ length: 13 }, (_, i) =>
      mockListRow({ id: `proj-${i + 1}` }),
    );
    mockPrisma.project.findMany.mockResolvedValue(rows);
    mockPrisma.project.count.mockResolvedValue(13);

    const result = await findProjectsPaginated(TEST_USER_ID);

    // 多取一条用于判断 hasMore
    expect(result.items).toHaveLength(12);
    expect(result.total).toBe(13);
    expect(result.nextCursor).toBe("proj-12");
  });

  it("末页 nextCursor 应为 null", async () => {
    const rows = Array.from({ length: 5 }, (_, i) =>
      mockListRow({ id: `proj-${i + 1}` }),
    );
    mockPrisma.project.findMany.mockResolvedValue(rows);
    mockPrisma.project.count.mockResolvedValue(5);

    const result = await findProjectsPaginated(TEST_USER_ID);

    expect(result.items).toHaveLength(5);
    expect(result.nextCursor).toBeNull();
  });

  it("空结果应返回 items=[], nextCursor=null, total=0", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    const result = await findProjectsPaginated(TEST_USER_ID);

    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
    expect(result.total).toBe(0);
  });

  it("status 筛选应正确过滤", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    await findProjectsPaginated(TEST_USER_ID, { status: "failed" });

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: TEST_USER_ID, status: "failed" },
      }),
    );
    expect(mockPrisma.project.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: TEST_USER_ID, status: "failed" },
      }),
    );
  });

  it("不传 status 时 where 仅包含 userId", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    await findProjectsPaginated(TEST_USER_ID);

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: TEST_USER_ID },
      }),
    );
  });

  it("pageSize=1 时返回单条记录", async () => {
    mockPrisma.project.findMany.mockResolvedValue([mockListRow({ id: "only" })]);
    mockPrisma.project.count.mockResolvedValue(1);

    const result = await findProjectsPaginated(TEST_USER_ID, { pageSize: 1 });

    expect(result.items).toHaveLength(1);
    // 单条，没多取 → take 应该是 2 (pageSize + 1)
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 2 }),
    );
  });

  it("pageSize=50 时 take 为 51", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    await findProjectsPaginated(TEST_USER_ID, { pageSize: 50 });

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51 }),
    );
  });

  it("pageSize > 50 应被截断为 50", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    await findProjectsPaginated(TEST_USER_ID, { pageSize: 100 });

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51 }),
    );
  });

  it("未传 pageSize 时默认 12", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(0);

    await findProjectsPaginated(TEST_USER_ID);

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 13 }),
    );
  });

  it("cursor 分页：传入 cursor 后 skip 已返回项", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.project.count.mockResolvedValue(50);

    await findProjectsPaginated(TEST_USER_ID, { cursor: "proj-12" });

    expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: "proj-12" },
        skip: 1,
      }),
    );
  });

  it("currentJob 为 null：项目无 generationJobs", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      mockListRow({ generationJobs: [] }),
    ]);
    mockPrisma.project.count.mockResolvedValue(1);

    const result = await findProjectsPaginated(TEST_USER_ID);

    expect(result.items[0].currentJob).toBeNull();
  });
});

describe("findProjectDetailById", () => {
  it("存在时应返回完整详情（含 currentJob + scenes）", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(mockDetailRow());

    const result = await findProjectDetailById("proj-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("proj-1");
    expect(result!.title).toBe("Test Project");
    expect(result!.sourceText).toBe("Full source text here...");
    expect(result!.currentJob).not.toBeNull();
    expect(result!.currentJob!.id).toBe("job-1");
    expect(result!.currentJob!.jobType).toBe("storyboard");
    expect(result!.currentStoryboardVersion).not.toBeNull();
    expect(result!.currentStoryboardVersion!.scenes).toHaveLength(1);
    expect(result!.currentStoryboardVersion!.scenes[0].id).toBe("scene-1");
  });

  it("不存在的 projectId 应返回 null", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const result = await findProjectDetailById("nonexistent");

    expect(result).toBeNull();
  });

  it("无 storyboard 时 currentStoryboardVersion 应为 null", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(
      mockDetailRow({ currentStoryboardVersion: null }),
    );

    const result = await findProjectDetailById("proj-1");

    expect(result!.currentStoryboardVersion).toBeNull();
    expect(result!.currentJob).not.toBeNull();
  });

  it("无 generationJobs 时 currentJob 应为 null", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(
      mockDetailRow({ generationJobs: [] }),
    );

    const result = await findProjectDetailById("proj-1");

    expect(result!.currentJob).toBeNull();
  });
});
