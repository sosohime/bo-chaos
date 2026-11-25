import type { Prisma } from '@mono/prisma-client';

export async function touchBoard(tx: Prisma.TransactionClient, boardId: string) {
  await tx.$executeRaw`
    UPDATE "GroupRankBoard"
    SET "updatedAt" = GREATEST("updatedAt", statement_timestamp())
    WHERE "id" = ${boardId}
  `;
}
