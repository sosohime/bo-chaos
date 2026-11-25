import type { GroupRankTemplate } from '@mono/types';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@mono/prisma-client';

export const GROUP_RANK_TEMPLATES: readonly GroupRankTemplate[] = [
  {
    id: 'running-distance',
    version: 1,
    name: '跑步里程',
    description: '记录每次跑步距离，本月累计里程越多越靠前。',
    metric: '本次里程',
    unit: 'km',
    precision: 2,
    min: '0.01',
    max: '1000',
    aggregate: 'sum',
    direction: 'desc',
    period: 'month',
    timeBasis: 'submittedAt',
  },
  {
    id: 'pull-ups',
    version: 1,
    name: '引体向上',
    description: '记录一次连续完成次数，按历史最高成绩排行。',
    metric: '连续次数',
    unit: '次',
    precision: 0,
    min: '0',
    max: '10000',
    aggregate: 'max',
    direction: 'desc',
    period: 'all_time',
    timeBasis: 'submittedAt',
  },
  {
    id: 'game-score',
    version: 1,
    name: '游戏高分',
    description: '记录同一玩法的游戏分数，按历史最高成绩排行。',
    metric: '本次分数',
    unit: '分',
    precision: 0,
    min: '0',
    max: '999999999',
    aggregate: 'max',
    direction: 'desc',
    period: 'all_time',
    timeBasis: 'submittedAt',
  },
];

export function getOfficialTemplate(id: string): GroupRankTemplate {
  const template = GROUP_RANK_TEMPLATES.find((item) => item.id === id);
  if (!template) throw new BadRequestException('不支持的官方玩法');
  return template;
}

export function validateScore(value: string, template: GroupRankTemplate) {
  if (!/^\d{1,9}(\.\d{1,3})?$/.test(value)) {
    throw new BadRequestException('请输入有效的非负数值');
  }
  const fraction = value.split('.')[1] || '';
  const score = new Prisma.Decimal(value);
  if (
    fraction.length > template.precision ||
    score.lt(template.min) ||
    score.gt(template.max)
  ) {
    throw new BadRequestException(
      `成绩范围为 ${template.min}—${template.max} ${template.unit}，最多 ${template.precision} 位小数`,
    );
  }
  return score;
}

export function periodStart(
  template: GroupRankTemplate,
  now = new Date(),
): Date | undefined {
  if (template.period === 'all_time') return undefined;
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(chinaTime.getUTCFullYear(), chinaTime.getUTCMonth(), 1) -
      8 * 60 * 60 * 1000,
  );
}
