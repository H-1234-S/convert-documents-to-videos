import { Prisma } from "@/generated/prisma/client";

/** 每日免费额度上限 */
export const DAILY_FREE_QUOTA = 1;

/** 额度检查结果 */
export interface QuotaCheckResult {
  /** 本次请求是否被允许 */
  allowed: boolean;
  /** 今日已使用次数 */
  used: number;
  /** 每日上限 */
  limit: number;
  /** 额度重置时间（次日 00:00:00 UTC） */
  resetsAt: Date;
}

/**
 * 根据 userId 计算当前时区今日的起止时间。
 * 使用 UTC+8 时区（中国标准时间）作为业务日边界。
 */
function getTodayRange(): { startOfDay: Date; endOfDay: Date } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  // UTC+8 时区的今日 00:00:00
  const startOfDay = new Date(Date.UTC(year, month, day, -8, 0, 0, 0));
  // UTC+8 时区的次日 00:00:00
  const endOfDay = new Date(Date.UTC(year, month, day, -8 + 24, 0, 0, 0));

  return { startOfDay, endOfDay };
}

/**
 * 检查用户今日剩余免费额度。
 *
 * 基于 GenerationJob 表中 `jobType="storyboard"` 且 `status != "cancelled"` 的记录计数，
 * 判断用户是否已达到每日免费配额上限。
 *
 * @param tx - Prisma 事务客户端（由调用方传入）
 * @param userId - 用户 ID
 * @returns QuotaCheckResult
 */
export async function checkDailyQuota(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<QuotaCheckResult> {
  const { startOfDay, endOfDay } = getTodayRange();

  const used = await tx.generationJob.count({
    where: {
      userId,
      jobType: "storyboard",
      status: { not: "cancelled" },
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const limit = DAILY_FREE_QUOTA;
  const allowed = used < limit;

  // 次日 00:00:00 (UTC+8) 作为重置时间
  const resetsAt = endOfDay;

  return { allowed, used, limit, resetsAt };
}
