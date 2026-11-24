import { Prisma } from '@mono/prisma-client';
import type { GroupRankBoardDetail, GroupRankBoardDto, GroupRankTemplate } from '@mono/types';
import { shortText } from './definitions';
import { mapProfile } from './profile.service';

export const RECOMMENDATION_TEMPLATE_ID = 'recommendation';
export const RECOMMENDATION_LIMIT = 5;
export const RECOMMENDATION_NOTE_MAX_LENGTH = 120;

export function normalizeRecommendationNote(input: string, required = true) {
  return shortText(input.replace(/[\r\n]+/g, ' '), '推荐语', RECOMMENDATION_NOTE_MAX_LENGTH, required);
}

export function isRecommendation(snapshot: Prisma.JsonValue) {
  return (snapshot as unknown as GroupRankTemplate | null)?.kind === 'recommendation';
}

type RecommendationSummary = NonNullable<GroupRankBoardDto['recommendationSummary']>;

export async function readRecommendationSummaries(tx: Prisma.TransactionClient, spaceId: string, boardIds: string[]) {
  const summaries = new Map<string, RecommendationSummary>(boardIds.map(id => [id, {
    recommendationCount: 0, todayCount: 0, leaderModel: null, winnerCount: 0,
  }]));
  if (!boardIds.length) return summaries;

  const rows = await tx.$queryRaw<{
    boardId: string;
    model: string;
    recommendationCount: bigint;
    todayCount: bigint;
    winnerCount: bigint;
  }[]>(Prisma.sql`
    WITH model_votes AS (
      SELECT i."boardId", i."id", i."model", COUNT(*) AS votes,
        COUNT(*) FILTER (WHERE r."createdAt" >= (
          date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai'
        ) AND r."createdAt" <= CURRENT_TIMESTAMP) AS today
      FROM "GroupRankBoard" b
      JOIN "GroupRankRecommendationItem" i ON i."boardId" = b."id"
      JOIN "GroupRankRecommendation" r ON r."itemId" = i."id"
      WHERE b."spaceId" = ${spaceId} AND b."deletedAt" IS NULL AND b."templateSnapshot"->>'kind' = 'recommendation'
      GROUP BY i."boardId", i."id", i."model"
    )
    SELECT DISTINCT ON ("boardId") "boardId", "model",
      SUM(votes) OVER (PARTITION BY "boardId")::bigint AS "recommendationCount",
      SUM(today) OVER (PARTITION BY "boardId")::bigint AS "todayCount",
      COUNT(*) OVER (PARTITION BY "boardId", votes) AS "winnerCount"
    FROM model_votes ORDER BY "boardId", votes DESC, "id" ASC
  `);
  for (const row of rows) {
    summaries.set(row.boardId, {
      recommendationCount: Number(row.recommendationCount),
      todayCount: Number(row.todayCount),
      leaderModel: row.model,
      winnerCount: Number(row.winnerCount),
    });
  }
  return summaries;
}

export async function readRecommendations(
  tx: Prisma.TransactionClient,
  boardId: string,
): Promise<NonNullable<GroupRankBoardDetail['recommendations']>> {
  const items = await tx.groupRankRecommendationItem.findMany({
    where: { boardId, recommendations: { some: {} } },
    orderBy: [{ recommendations: { _count: 'desc' } }, { id: 'asc' }],
    include: {
      recommendations: {
        orderBy: [{ createdAt: 'asc' }, { userId: 'asc' }],
        select: { note: true, user: { select: { id: true, nickname: true, avatarKey: true } } },
      },
    },
  });
  let rank = 0;
  return {
    limit: RECOMMENDATION_LIMIT,
    items: items.map(({ id, model, recommendations }, index) => {
      if (index === 0 || recommendations.length !== items[index - 1].recommendations.length)
        rank = index + 1;
      return {
        id, model, rank,
        recommenders: recommendations.map(({ user, note }) => ({ ...mapProfile(user), ...(note ? { note } : {}) })),
      };
    }),
  };
}
