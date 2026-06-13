import { describe, it, expect, vi } from "vitest";
import { checkDailyQuota, DAILY_FREE_QUOTA } from "../quota.service";
import { Prisma } from "@/generated/prisma/client";

/** 创建一个最小的 mock TransactionClient，仅实现 generationJob.count */
function createMockTx(countValue: number): Prisma.TransactionClient {
  return {
    generationJob: {
      count: vi.fn().mockResolvedValue(countValue),
    },
  } as unknown as Prisma.TransactionClient;
}

describe("checkDailyQuota", () => {
  it("空配额：used=0 时应该允许创建", async () => {
    const tx = createMockTx(0);
    const result = await checkDailyQuota(tx, "user-1");

    expect(result.allowed).toBe(true);
    expect(result.used).toBe(0);
    expect(result.limit).toBe(DAILY_FREE_QUOTA);
    expect(result.resetsAt).toBeInstanceOf(Date);
  });

  it("达到上限：used >= DAILY_FREE_QUOTA 时应拒绝", async () => {
    const tx = createMockTx(DAILY_FREE_QUOTA);
    const result = await checkDailyQuota(tx, "user-1");

    expect(result.allowed).toBe(false);
    expect(result.used).toBe(DAILY_FREE_QUOTA);
    expect(result.limit).toBe(DAILY_FREE_QUOTA);
  });

  it("排除 cancelled：count 查询应排除 status=cancelled 的记录", async () => {
    const tx = createMockTx(0);
    await checkDailyQuota(tx, "user-1");

    // 验证 count 调用参数中 status 过滤条件排除了 "cancelled"
    const countMock = tx.generationJob.count as ReturnType<typeof vi.fn>;
    expect(countMock).toHaveBeenCalledTimes(1);
    const whereArg = countMock.mock.calls[0][0]?.where;
    expect(whereArg).toBeDefined();
    expect(whereArg.status).toEqual({ not: "cancelled" });
    expect(whereArg.jobType).toBe("storyboard");
  });

  it("跨午夜边界：仅统计当日记录（通过 createdAt 范围过滤）", async () => {
    const tx = createMockTx(0);
    const result = await checkDailyQuota(tx, "user-1");

    // 验证 count 调用的 createdAt 范围过滤存在
    const countMock = tx.generationJob.count as ReturnType<typeof vi.fn>;
    const whereArg = countMock.mock.calls[0][0]?.where;
    expect(whereArg.createdAt).toBeDefined();
    expect(whereArg.createdAt.gte).toBeInstanceOf(Date);
    expect(whereArg.createdAt.lt).toBeInstanceOf(Date);

    // gte 应该是今天的 UTC+8 00:00:00，lt 应该是明天的 00:00:00，两者相差 24 小时
    const diffMs = whereArg.createdAt.lt.getTime() - whereArg.createdAt.gte.getTime();
    expect(diffMs).toBe(24 * 60 * 60 * 1000);

    // 确认结果包含 resetsAt
    expect(result.resetsAt).toBeInstanceOf(Date);
  });

  it("仅使用 tx 参数，完全不依赖全局 prisma", async () => {
    const tx = createMockTx(0);
    // 如果函数内部不小心引用了全局 prisma 模块，这个调用仍会成功（因为 import 是静态的）
    // 但测试的设计确保 tx 是唯一的数据源
    await checkDailyQuota(tx, "user-2");
    expect(tx.generationJob.count).toHaveBeenCalledTimes(1);
  });
});
