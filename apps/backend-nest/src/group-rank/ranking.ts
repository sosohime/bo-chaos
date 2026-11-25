import { Prisma } from '@mono/prisma-client';
import type { GroupRankRow, GroupRankTemplate } from '@mono/types';

export function rankScores(
  scores: { userId: string; score: Prisma.Decimal }[],
  template: GroupRankTemplate,
): GroupRankRow[] {
  const sorted = [...scores].sort((a, b) => {
    const comparison =
      a.score.comparedTo(b.score) * (template.direction === 'desc' ? -1 : 1);
    return comparison || a.userId.localeCompare(b.userId);
  });
  let rank = 0;
  return sorted.map((row, index) => {
    if (index === 0 || !row.score.equals(sorted[index - 1].score))
      rank = index + 1;
    return {
      userId: row.userId,
      displayName: `群友 ${row.userId.slice(-4)}`,
      score: row.score.toFixed(template.precision),
      rank,
    };
  });
}
