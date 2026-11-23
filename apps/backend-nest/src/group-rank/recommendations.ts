import type { Prisma } from '@mono/prisma-client';
import type { GroupRankBoardDetail, GroupRankTemplate } from '@mono/types';
import { mapProfile } from './profile.service';

export const RECOMMENDATION_TEMPLATE_ID = 'recommendation';
export const RECOMMENDATION_LIMIT = 5;

export function isRecommendation(snapshot: Prisma.JsonValue) {
  return (snapshot as unknown as GroupRankTemplate | null)?.kind === 'recommendation';
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
        select: { user: { select: { id: true, nickname: true, avatarKey: true } } },
      },
    },
  });
  let rank = 0;
  return {
    limit: RECOMMENDATION_LIMIT,
    items: items.map(({ id, model, recommendations }, index) => {
      if (index === 0 || recommendations.length !== items[index - 1].recommendations.length)
        rank = index + 1;
      return { id, model, rank, recommenders: recommendations.map(({ user }) => mapProfile(user)) };
    }),
  };
}
