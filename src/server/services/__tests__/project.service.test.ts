import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import {
  createProject,
  hashUserId,
  isUniqueConstraintError,
  QuotaExceededError,
  ConcurrentLimitError,
  DuplicateRequestError,
  listProjects,
  getProjectById,
  ProjectNotFoundError,
  ProjectAccessDeniedError,
} from "../project.service";
import type { CreateProjectInput } from "../project.service";

// ---- Mocks ----

const mockTx = {
  $executeRawUnsafe: vi.fn().mockResolvedValue(0),
  project: {
    count: vi.fn().mockResolvedValue(0),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
  },
  generationJob: {
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn(),
    findUnique: vi.fn().mockResolvedValue(null),
  },
};

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: vi.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
    generationJob: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock repo layer for list/getById tests
const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    findProjectsPaginated: vi.fn(),
    findProjectDetailById: vi.fn(),
  },
}));

vi.mock("@/lib/db/repositories/project.repo", () => mockRepo);

// Import mocked prisma
const { prisma } = await import("@/lib/db/client");
const mockPrisma = prisma as unknown as {
  $transaction: ReturnType<typeof vi.fn>;
  generationJob: { findUnique: ReturnType<typeof vi.fn> };
};

const TEST_USER_ID = "user-test-123";
const DEFAULT_INPUT: CreateProjectInput = {
  sourceText: "Hello World",
  requestId: "550e8400-e29b-41d4-a716-446655440000",
};

function makeInput(overrides: Partial<CreateProjectInput> = {}): CreateProjectInput {
  return { ...DEFAULT_INPUT, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();

  // 重置为默认 mock 实现
  mockTx.$executeRawUnsafe.mockResolvedValue(0);
  mockTx.project.count.mockResolvedValue(0);
  mockTx.project.findFirst.mockResolvedValue(null);
  mockTx.generationJob.count.mockResolvedValue(0);
  mockTx.generationJob.findUnique.mockResolvedValue(null);

  // $transaction: 执行 fn(mockTx) 并返回其结果
  mockPrisma.$transaction.mockImplementation(
    (fn: (tx: typeof mockTx) => unknown) => fn(mockTx),
  );
});

// ---- Tests ----

describe("hashUserId", () => {
  it("应返回 bigint 类型", () => {
    const result = hashUserId("test-user");
    expect(typeof result).toBe("bigint");
  });

  it("相同输入应产生相同哈希", () => {
    const a = hashUserId("user-abc");
    const b = hashUserId("user-abc");
    expect(a).toBe(b);
  });

  it("不同输入应产生不同哈希", () => {
    const a = hashUserId("user-abc");
    const b = hashUserId("user-xyz");
    expect(a).not.toBe(b);
  });
});

describe("isUniqueConstraintError", () => {
  it("P2002 错误应返回 true", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion: "7.8.0",
    });
    expect(isUniqueConstraintError(error)).toBe(true);
  });

  it("非 P2002 Prisma 错误应返回 false", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Not found", {
      code: "P2025",
      clientVersion: "7.8.0",
    });
    expect(isUniqueConstraintError(error)).toBe(false);
  });

  it("普通 Error 应返回 false", () => {
    expect(isUniqueConstraintError(new Error("test"))).toBe(false);
  });
});

describe("createProject", () => {
  it("正常创建：返回 projectId 和 jobId", async () => {
    mockTx.project.create.mockResolvedValue({ id: "project-1" });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-1" });

    const result = await createProject(DEFAULT_INPUT, TEST_USER_ID, false);

    expect(result).toEqual({ projectId: "project-1", jobId: "job-1" });
    expect(mockTx.$executeRawUnsafe).toHaveBeenCalled();
    expect(mockTx.project.create).toHaveBeenCalledTimes(1);
    expect(mockTx.generationJob.create).toHaveBeenCalledTimes(1);
  });

  it("额度超限：非 admin 超限应抛 QuotaExceededError", async () => {
    // quota check returns used=1, limit=1 → not allowed
    mockTx.generationJob.count.mockResolvedValue(1);

    await expect(
      createProject(DEFAULT_INPUT, TEST_USER_ID, false),
    ).rejects.toThrow(QuotaExceededError);

    // Project 不应被创建
    expect(mockTx.project.create).not.toHaveBeenCalled();
  });

  it("admin 豁免：admin 即使超限也应创建成功", async () => {
    mockTx.generationJob.count.mockResolvedValue(5); // 已超过限额
    mockTx.project.create.mockResolvedValue({ id: "project-admin" });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-admin" });

    const result = await createProject(DEFAULT_INPUT, TEST_USER_ID, true);

    expect(result.projectId).toBe("project-admin");
    expect(result.jobId).toBe("job-admin");
  });

  it("并发限制：有活跃项目时应抛 ConcurrentLimitError", async () => {
    // quota OK
    mockTx.generationJob.count.mockResolvedValue(0);
    // 已有活跃项目
    mockTx.project.count.mockResolvedValue(1);
    mockTx.project.findFirst.mockResolvedValue({ id: "active-project" });

    await expect(
      createProject(DEFAULT_INPUT, TEST_USER_ID, false),
    ).rejects.toThrow(ConcurrentLimitError);
  });

  it("幂等冲突：requestId 已存在 → DuplicateRequestError（事务内 findUnique 触发）", async () => {
    // 事务内 findUnique 返回已存在记录 → 直接抛出 DuplicateRequestError
    mockTx.generationJob.findUnique.mockResolvedValue({
      id: "existing-job",
      projectId: "existing-project",
    });

    await expect(
      createProject(DEFAULT_INPUT, TEST_USER_ID, false),
    ).rejects.toThrow(DuplicateRequestError);

    // Project 不应被创建（在幂等检查后就直接抛出了）
    expect(mockTx.project.create).not.toHaveBeenCalled();
  });

  it("title 截断：超长 sourceText 应截取前 50 字符 + ...", async () => {
    const longText = "A".repeat(100);
    mockTx.project.create.mockImplementation(async (args: { data: { title: string } }) => {
      expect(args.data.title).toBe("A".repeat(50) + "...");
      expect(args.data.title.length).toBe(53); // 50 + "..."
      return { id: "project-truncated" };
    });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-truncated" });

    await createProject(makeInput({ sourceText: longText }), TEST_USER_ID, false);

    expect(mockTx.project.create).toHaveBeenCalledTimes(1);
  });

  it("短文本 title 不应截断", async () => {
    const shortText = "Short";
    mockTx.project.create.mockImplementation(async (args: { data: { title: string } }) => {
      expect(args.data.title).toBe("Short");
      return { id: "project-short" };
    });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-short" });

    await createProject(makeInput({ sourceText: shortText }), TEST_USER_ID, false);
  });

  it("可选字段默认值：未指定 aspectRatio 时默认 16:9", async () => {
    mockTx.project.create.mockImplementation(async (args: { data: { aspectRatio: string } }) => {
      expect(args.data.aspectRatio).toBe("16:9");
      return { id: "project-default" };
    });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-default" });

    await createProject(DEFAULT_INPUT, TEST_USER_ID, false);
  });

  it("可选字段传递：指定全部可选字段应正确传递", async () => {
    mockTx.project.create.mockResolvedValue({ id: "project-full" });
    mockTx.generationJob.create.mockResolvedValue({ id: "job-full" });

    const input = makeInput({
      aspectRatio: "9:16",
      audienceRole: "teacher",
      audienceLevel: "advanced",
      targetDurationSec: 120,
      voiceProvider: "azure",
      voiceId: "zh-CN-YunxiNeural",
    });

    await createProject(input, TEST_USER_ID, false);

    const createCall = mockTx.project.create.mock.calls[0][0];
    expect(createCall.data.aspectRatio).toBe("9:16");
    expect(createCall.data.audienceRole).toBe("teacher");
    expect(createCall.data.audienceLevel).toBe("advanced");
    expect(createCall.data.targetDurationSec).toBe(120);
    expect(createCall.data.voiceProvider).toBe("azure");
    expect(createCall.data.voiceId).toBe("zh-CN-YunxiNeural");
  });

  it("事务原子性验证：GenerationJob 创建失败（非 P2002）时 Project 也应回滚", async () => {
    mockTx.project.create.mockResolvedValue({ id: "project-rollback" });
    // 抛出非 P2002 错误（P2000 是输入值太长的错误，但不会触发幂等分支）
    mockTx.generationJob.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Value too long", {
        code: "P2000",
        clientVersion: "7.8.0",
      }),
    );

    // 非 P2002 错误应该直接向上抛，事务自动回滚
    await expect(
      createProject(DEFAULT_INPUT, TEST_USER_ID, false),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);

    // Prisma $transaction 在内部函数抛错时会回滚，这里验证错误被正确传播
  });
});

// ---- listProjects tests ----

describe("listProjects", () => {

  it("应正确委托 repo.findProjectsPaginated", async () => {
    const expectedResult = {
      items: [],
      nextCursor: null,
      total: 0,
    };
    mockRepo.findProjectsPaginated.mockResolvedValue(expectedResult);

    const result = await listProjects(TEST_USER_ID, { pageSize: 24, status: "completed" });

    expect(mockRepo.findProjectsPaginated).toHaveBeenCalledWith(TEST_USER_ID, {
      pageSize: 24,
      status: "completed",
    });
    expect(result).toEqual(expectedResult);
  });

  it("参数应原样透传（userId + options）", async () => {
    mockRepo.findProjectsPaginated.mockResolvedValue({ items: [], nextCursor: null, total: 0 });

    await listProjects(TEST_USER_ID);

    expect(mockRepo.findProjectsPaginated).toHaveBeenCalledWith(TEST_USER_ID, {});
  });
});

// ---- getProjectById tests ----

describe("getProjectById", () => {
  const OTHER_USER_ID = "user-other-456";

  const mockDetail = {
    id: "proj-1",
    userId: TEST_USER_ID,
    title: "Test",
    sourceText: "Hello",
    status: "completed",
    audienceRole: null,
    audienceLevel: null,
    aspectRatio: "16:9",
    targetDurationSec: 120,
    voiceProvider: null,
    voiceId: null,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentJob: null,
    currentStoryboardVersion: null,
  };

  it("owner 可查看自己的项目", async () => {
    mockRepo.findProjectDetailById.mockResolvedValue(mockDetail);

    const result = await getProjectById("proj-1", TEST_USER_ID, false);

    expect(result).toEqual(mockDetail);
  });

  it("admin 可查看他人的项目", async () => {
    mockRepo.findProjectDetailById.mockResolvedValue({
      ...mockDetail,
      userId: OTHER_USER_ID,
    });

    const result = await getProjectById("proj-1", TEST_USER_ID, true);

    expect(result).not.toBeNull();
    expect(result.userId).toBe(OTHER_USER_ID);
  });

  it("非 owner 非 admin 应抛 ProjectAccessDeniedError", async () => {
    mockRepo.findProjectDetailById.mockResolvedValue({
      ...mockDetail,
      userId: OTHER_USER_ID,
    });

    await expect(
      getProjectById("proj-1", TEST_USER_ID, false),
    ).rejects.toThrow(ProjectAccessDeniedError);
  });

  it("项目不存在应抛 ProjectNotFoundError", async () => {
    mockRepo.findProjectDetailById.mockResolvedValue(null);

    await expect(
      getProjectById("nonexistent", TEST_USER_ID, false),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});
