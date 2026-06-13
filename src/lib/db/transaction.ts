import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";

export async function executeTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}
