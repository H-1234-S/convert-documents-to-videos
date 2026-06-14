import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller } from "../_app";
import type { Context } from "../../context";

// ---- Mocks ----

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: vi.fn(),
    generationJob: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/inngest/client", () => ({
  EVENTS: { VIDEO_GENERATE_REQUESTED: "video/generate.requested" },
  sendGenerateRequested: vi.fn().mockResolvedValue(undefined),
  inngest: {},
}));

vi.mock("../../services/quota.service", async () => {
  const actual = await vi.importActual("../../services/quota.service");
  return {
    ...actual,
  };
});

const { prisma: mockPrisma } = await import("@/lib/db/client");
const { sendGenerateRequested: mockSendEvent } =
  await import("@/inngest/client");

// ---- Tx Builder ----

/** 创建默认 mock tx（空配额、无活跃项目） */
function createTxMock(overrides: Record<string, unknown> = {}) {
  const genJobOverrides = (overrides.generationJob as Record<string, unknown>) || {};
  const projectOverrides = (overrides.project as Record<string, unknown>) || {};

  return {
    $executeRawUnsafe: vi.fn().mockResolvedValue(0),
    generationJob: {
      count: vi.fn().mockResolvedValue(0),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "job-test" }),
      ...genJobOverrides,
    },
    project: {
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "project-test" }),
      ...projectOverrides,
    },
  };
}

// ---- Helpers ----

/** 创建一个未认证的 Context */
function createAnonCtx(): Context {
  return {
    session: null,
    userId: null,
    userEmail: null,
    isAdmin: false,
  };
}

/** 创建一个已认证用户的 Context */
function createUserCtx(overrides: Partial<Context> = {}): Context {
  return {
    session: {
      id: "session-1",
      userId: "user-test-1",
      user: {
        id: "user-test-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expiresAt: new Date(Date.now() + 86400000),
      token: "test-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
    userId: "user-test-1",
    userEmail: "test@example.com",
    isAdmin: overrides.isAdmin ?? false,
    ...overrides,
  };
}

/** 有效的输入参数 */
function validInput(overrides: Record<string, unknown> = {}) {
  return {
    sourceText: "Hello World",
    requestId: "550e8400-e29b-41d4-a716-446655440000",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---- Tests ----

describe("project.createAndGenerate", () => {
  // --- Unauthenticated ---

  it("未认证用户应返回 UNAUTHORIZED", async () => {
    const caller = createCaller(createAnonCtx());

    await expect(
      caller.project.createAndGenerate(validInput()),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  // --- Validation ---

  it("空文本应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.createAndGenerate(validInput({ sourceText: "" })),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("无效 requestId 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.createAndGenerate(
        validInput({ requestId: "not-a-uuid" }),
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("无效 aspectRatio 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.createAndGenerate(validInput({ aspectRatio: "4:3" })),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("超长 sourceText 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.createAndGenerate(
        validInput({ sourceText: "a".repeat(5001) }),
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  // --- Success Path ---

  it("正常输入返回 projectId 和 jobId", async () => {
    const caller = createCaller(createUserCtx());
    const tx = createTxMock();
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));
    (mockSendEvent as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await caller.project.createAndGenerate(validInput());

    expect(result).toEqual({ projectId: "project-test", jobId: "job-test" });
    expect(mockSendEvent).toHaveBeenCalled();
  });

  // --- Error Mapping ---

  it("额度超限应返回 TOO_MANY_REQUESTS [QUOTA_EXCEEDED]", async () => {
    const caller = createCaller(createUserCtx());
    // quota check returns used=1 (at limit → not allowed)
    const tx = createTxMock({
      generationJob: { count: vi.fn().mockResolvedValue(1) },
    });
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));

    await expect(
      caller.project.createAndGenerate(validInput()),
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: expect.stringContaining("[QUOTA_EXCEEDED]"),
    });
  });

  it("并发限制应返回 TOO_MANY_REQUESTS [CONCURRENT_LIMIT]", async () => {
    const caller = createCaller(createUserCtx());
    const tx = createTxMock({
      project: {
        count: vi.fn().mockResolvedValue(1),
        findFirst: vi.fn().mockResolvedValue({ id: "active-p1" }),
      },
    });
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));

    await expect(
      caller.project.createAndGenerate(validInput()),
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: expect.stringContaining("[CONCURRENT_LIMIT]"),
    });
  });

  it("幂等冲突应返回 CONFLICT [DUPLICATE_REQUEST]", async () => {
    const caller = createCaller(createUserCtx());

    // 事务内 findUnique 返回已存在记录 → DuplicateRequestError
    const tx = createTxMock({
      generationJob: {
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn().mockResolvedValue({
          id: "existing-job",
          projectId: "existing-project",
        }),
      },
    });
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));

    await expect(
      caller.project.createAndGenerate(validInput()),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringContaining("[DUPLICATE_REQUEST]"),
    });
  });

  it("admin 豁免：admin 用户即使额度超限也能成功", async () => {
    const caller = createCaller(createUserCtx({ isAdmin: true }));
    const tx = createTxMock({
      generationJob: {
        count: vi.fn().mockResolvedValue(5),
        create: vi.fn().mockResolvedValue({ id: "job-admin" }),
      },
      project: {
        count: vi.fn().mockResolvedValue(0),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-admin" }),
      },
    });
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));
    (mockSendEvent as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await caller.project.createAndGenerate(validInput());

    expect(result).toEqual({ projectId: "project-admin", jobId: "job-admin" });
  });

  it("Inngest 发送失败应仍然返回成功", async () => {
    const caller = createCaller(createUserCtx());
    const tx = createTxMock({
      generationJob: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue({ id: "job-inngest-fail" }),
      },
      project: {
        count: vi.fn().mockResolvedValue(0),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "project-inngest-fail" }),
      },
    });
    (
      mockPrisma.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));
    (mockSendEvent as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Inngest connection failed"),
    );

    // 不应抛错误——Inngest 失败不阻塞 API 响应
    const result = await caller.project.createAndGenerate(validInput());

    expect(result).toEqual({
      projectId: "project-inngest-fail",
      jobId: "job-inngest-fail",
    });
  });
});

// ---- project.list tests ----

describe("project.list", () => {
  it("未认证用户应返回 UNAUTHORIZED", async () => {
    const caller = createCaller(createAnonCtx());

    await expect(caller.project.list({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("正常返回分页列表", async () => {
    const caller = createCaller(createUserCtx());
    const mockDate = new Date("2026-06-13T08:00:00.000Z");

    (mockPrisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
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
      },
    ]);
    (mockPrisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await caller.project.list({});

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("proj-1");
    expect(result.items[0].currentJob).not.toBeNull();
  });

  it("空列表应返回空 items", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    (mockPrisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await caller.project.list({});

    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
    expect(result.total).toBe(0);
  });

  it("status 筛选应正确传递", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      [],
    );
    (mockPrisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    await caller.project.list({ status: "failed" });

    const findManyCall = (
      mockPrisma.project.findMany as ReturnType<typeof vi.fn>
    ).mock.calls[0]?.[0];
    expect(findManyCall.where).toMatchObject({ status: "failed" });
  });

  it("无效 pageSize（>50）应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.list({ pageSize: 100 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("无效 status 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.list({ status: "invalid_status" as never }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ---- project.getById tests ----

describe("project.getById", () => {
  const mockDate = new Date("2026-06-13T08:00:00.000Z");

  function mockDetailRow(overrides: Record<string, unknown> = {}) {
    return {
      id: "proj-1",
      userId: "user-test-1",
      title: "Test Project",
      sourceText: "Full source text...",
      status: "completed",
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

  it("未认证用户应返回 UNAUTHORIZED", async () => {
    const caller = createCaller(createAnonCtx());

    await expect(
      caller.project.getById({ projectId: "proj-1" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("owner 可查看自己的项目", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDetailRow(),
    );

    const result = await caller.project.getById({ projectId: "proj-1" });

    expect(result.id).toBe("proj-1");
    expect(result.title).toBe("Test Project");
    expect(result.sourceText).toBe("Full source text...");
    // userId 不应泄露
    expect((result as Record<string, unknown>).userId).toBeUndefined();
    expect(result.currentJob).not.toBeNull();
    expect(result.currentStoryboardVersion).not.toBeNull();
  });

  it("非 owner 应返回 FORBIDDEN", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDetailRow({ userId: "other-user" }),
    );

    await expect(
      caller.project.getById({ projectId: "proj-1" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("[PROJECT_ACCESS_DENIED]"),
    });
  });

  it("admin 可查看他人项目返回 200", async () => {
    const caller = createCaller(createUserCtx({ isAdmin: true }));

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDetailRow({ userId: "other-user" }),
    );

    const result = await caller.project.getById({ projectId: "proj-1" });

    expect(result.id).toBe("proj-1");
    // userId 不应泄露给前端
    expect((result as Record<string, unknown>).userId).toBeUndefined();
  });

  it("不存在的 projectId 应返回 NOT_FOUND", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    await expect(
      caller.project.getById({ projectId: "nonexistent" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: expect.stringContaining("[PROJECT_NOT_FOUND]"),
    });
  });

  it("projectId 为空字符串应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.getById({ projectId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("无效 projectId 格式应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.getById({ projectId: "<script>" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ---- project.delete tests ----

describe("project.delete", () => {
  it("未认证用户应返回 UNAUTHORIZED", async () => {
    const caller = createCaller(createAnonCtx());

    await expect(
      caller.project.delete({ projectId: "proj-1" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("owner 可删除自己的项目", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-test-1",
      status: "completed",
    });
    (mockPrisma.project.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await caller.project.delete({ projectId: "proj-1" });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "proj-1" },
      data: { status: "deleted" },
    });
  });

  it("非 owner 应返回 FORBIDDEN", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "other-user",
      status: "completed",
    });

    await expect(
      caller.project.delete({ projectId: "proj-1" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("[PROJECT_ACCESS_DENIED]"),
    });
  });

  it("不存在的 projectId 应返回 NOT_FOUND", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    await expect(
      caller.project.delete({ projectId: "nonexistent" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: expect.stringContaining("[PROJECT_NOT_FOUND]"),
    });
  });

  it("空 projectId 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.delete({ projectId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ---- project.retry tests ----

describe("project.retry", () => {
  it("未认证用户应返回 UNAUTHORIZED", async () => {
    const caller = createCaller(createAnonCtx());

    await expect(
      caller.project.retry({ projectId: "proj-1" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("owner 可重试自己的项目", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-test-1",
      status: "failed",
      sourceText: "Test",
      aspectRatio: "16:9",
      audienceRole: null,
      audienceLevel: null,
      targetDurationSec: null,
      voiceProvider: null,
      voiceId: null,
    });
    (mockPrisma.generationJob.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "new-job",
    });
    (mockPrisma.project.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await caller.project.retry({ projectId: "proj-1" });

    expect(result).toEqual({ jobId: "new-job" });
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { id: "proj-1" },
      data: {
        status: "queued",
        errorCode: null,
        errorMessage: null,
      },
    });
    expect(mockSendEvent).toHaveBeenCalled();
  });

  it("非 owner 应返回 FORBIDDEN", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "other-user",
      status: "failed",
    });

    await expect(
      caller.project.retry({ projectId: "proj-1" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("[PROJECT_ACCESS_DENIED]"),
    });
  });

  it("不存在的 projectId 应返回 NOT_FOUND", async () => {
    const caller = createCaller(createUserCtx());

    (mockPrisma.project.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    await expect(
      caller.project.retry({ projectId: "nonexistent" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: expect.stringContaining("[PROJECT_NOT_FOUND]"),
    });
  });

  it("空 projectId 应返回 BAD_REQUEST", async () => {
    const caller = createCaller(createUserCtx());

    await expect(
      caller.project.retry({ projectId: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
