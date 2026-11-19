import { Prisma } from '@mono/prisma-client';
import type { GroupRankBoardDto, GroupRankTemplate } from '@mono/types';

type Summary = NonNullable<GroupRankBoardDto['summary']>;
type Leader = {
  boardId: string;
  userId: string;
  displayName: string;
  avatarVersion: string | null;
  participantId: string | null;
  recordedById: string | null;
  score: Prisma.Decimal;
  rank: bigint;
  participantCount: bigint;
  winnerCount: bigint;
};

// A single group-scoped aggregate query avoids a detail/profile/history query per card.
export async function groupSummaries(
  tx: Prisma.TransactionClient,
  spaceId: string,
  boards: {
    id: string;
    creatorId: string;
    templateSnapshot: Prisma.JsonValue;
  }[],
): Promise<Map<string, Summary>> {
  const rows = await tx.$queryRaw<Leader[]>(Prisma.sql`
    WITH boards AS (
      SELECT "id", "creatorId", "templateSnapshot" AS rule FROM "GroupRankBoard"
      WHERE "spaceId" = ${spaceId} AND "deletedAt" IS NULL
    ), records AS (
      SELECT e."id", e."boardId", e."userId", NULL::text AS "participantId",
             e."value", e."createdAt", e."recordedById"
      FROM "GroupRankEntry" e JOIN boards b ON b."id" = e."boardId"
      WHERE e."deletedAt" IS NULL
      UNION ALL
      SELECT e."id", e."boardId", 'proxy:' || e."participantId", e."participantId",
             e."value", e."createdAt", b."creatorId"
      FROM "GroupRankProxyEntry" e JOIN boards b ON b."id" = e."boardId"
      JOIN "GroupRankProxyParticipant" p ON p."id" = e."participantId" AND p."boardId" = e."boardId"
      WHERE e."deletedAt" IS NULL AND p."claimedUserId" IS NULL
    ), ordered AS (
      SELECT r.*, b.rule, ROW_NUMBER() OVER (
        PARTITION BY r."boardId", r."userId" ORDER BY r."createdAt" DESC, r."id" DESC
      ) AS recent
      FROM records r JOIN boards b ON b."id" = r."boardId"
      WHERE b.rule->>'period' <> 'month' OR (
        r."createdAt" >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'
        AND r."createdAt" <= CURRENT_TIMESTAMP + interval '1 millisecond'
      )
    ), scores AS (
      SELECT "boardId", "userId", "participantId", rule,
        CASE rule->>'aggregate'
          WHEN 'sum' THEN SUM("value")
          WHEN 'max' THEN MAX("value")
          ELSE MAX("value") FILTER (WHERE recent = 1)
        END AS score,
        MAX("recordedById") AS "recordedById"
      FROM ordered GROUP BY "boardId", "userId", "participantId", rule
    ), ranked AS (
      SELECT s.*, RANK() OVER (PARTITION BY "boardId" ORDER BY
        CASE WHEN rule->>'direction' = 'asc' THEN score ELSE -score END
      ) AS rank,
      ROW_NUMBER() OVER (PARTITION BY "boardId" ORDER BY
        CASE WHEN rule->>'direction' = 'asc' THEN score ELSE -score END, "userId"
      ) AS position, COUNT(*) OVER (PARTITION BY "boardId") AS "participantCount"
      FROM scores s
    ), counted AS (
      SELECT r.*, COUNT(*) FILTER (WHERE rank = 1) OVER (PARTITION BY "boardId") AS "winnerCount"
      FROM ranked r
    )
    SELECT r."boardId", r."userId", r."participantId", r."recordedById", r.score, r.rank,
      r."participantCount", r."winnerCount",
      COALESCE(p."displayName", u.nickname, '群友 ' || RIGHT(r."userId", 4)) AS "displayName",
      u."avatarKey" AS "avatarVersion"
    FROM counted r
    LEFT JOIN "GroupRankUser" u ON u."id" = r."userId"
    LEFT JOIN "GroupRankProxyParticipant" p ON p."id" = r."participantId"
    WHERE r.position <= 3 ORDER BY r."boardId", r.position
  `);
  const templates = new Map(
    boards.map((board) => [
      board.id,
      board.templateSnapshot as unknown as GroupRankTemplate,
    ]),
  );
  const result = new Map<string, Summary>(
    boards.map((board) => [
      board.id,
      { leaders: [], participantCount: 0, winnerCount: 0 },
    ]),
  );
  for (const row of rows) {
    const summary = result.get(row.boardId);
    const template = templates.get(row.boardId);
    if (!summary || !template) continue;
    summary.participantCount = Number(row.participantCount);
    summary.winnerCount = Number(row.winnerCount);
    summary.leaders.push({
      userId: row.userId,
      displayName: row.displayName,
      avatarVersion: row.avatarVersion,
      score: new Prisma.Decimal(row.score).toFixed(template.precision),
      rank: Number(row.rank),
      ...(row.recordedById ? { recordedById: row.recordedById } : {}),
      ...(row.participantId
        ? { participantId: row.participantId, pendingClaim: true }
        : {}),
    });
  }
  return result;
}
