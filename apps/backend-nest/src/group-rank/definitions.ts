import { normalizeBackground } from './background-contract';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type {
  GroupRankDefinition,
  GroupRankDraftDto,
  GroupRankTemplate,
} from '@mono/types';
import type { Prisma } from '@mono/prisma-client';
import type { PrismaService } from '@/library/prisma.service';

export function shortText(
  input: unknown,
  label: string,
  max: number,
  required = true,
): string {
  if (typeof input !== 'string')
    throw new BadRequestException(`请填写${label}`);
  const text = input.normalize('NFKC').trim();
  if (
    (required && !text) ||
    Array.from(text).length > max ||
    /[\p{Cc}\p{Cf}]/u.test(text)
  )
    throw new BadRequestException(
      `${label}请填写${required ? '1—' : '不超过'}${max}个普通字符`,
    );
  return text;
}

export function normalizeAccentColor(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(input))
    throw new BadRequestException('请选择有效的榜单颜色');
  return input.toUpperCase();
}

export function normalizeDefinition(
  input: GroupRankDefinition,
): GroupRankDefinition {
  const name = shortText(input?.name, '排行名称', 24);
  const unit = shortText(input?.unit ?? '', '单位', 12, false);
  if (
    !['latest', 'max', 'sum'].includes(input.aggregate) ||
    (input.entryMode !== undefined && !['single', 'multiple'].includes(input.entryMode)) ||
    !['asc', 'desc'].includes(input.direction) ||
    !['all_time', 'month'].includes(input.period) ||
    (input.themeId !== undefined &&
      !['volt', 'midnight', 'coral'].includes(input.themeId))
  )
    throw new BadRequestException('请选择支持的计分规则');
  return {
    ...(input.accentColor !== undefined ? { accentColor: normalizeAccentColor(input.accentColor) } : {}),
    ...(input.themeId ? { themeId: input.themeId } : {}),
    ...(input.background !== undefined
      ? { background: normalizeBackground(input.background) }
      : {}),
    entryMode: input.entryMode || 'multiple',
    name,
    unit,
    aggregate: input.entryMode === 'single' ? 'latest' : input.aggregate,
    direction: input.direction,
    period: input.period,
  };
}

export function customTemplate(
  id: string,
  definition: GroupRankDefinition,
): GroupRankTemplate {
  const rule = definition.entryMode === 'single' ? '每人一笔，可修改原记录' : {
    latest: '按每人最新一次记录排序',
    max: '按每人最高一次记录排序',
    sum: '按每人累计数值排序',
  }[definition.aggregate];
  return {
    id: `custom:${id}`,
    entryMode: definition.entryMode || 'multiple',
    themeId: definition.themeId || 'volt',
    accentColor: normalizeAccentColor(definition.accentColor),
    background: (definition.background ||
      null) as GroupRankTemplate['background'],
    version: 1,
    name: definition.name,
    description: rule + '，同分并列。',
    metric: '填写数值',
    unit: definition.unit,
    precision: 3,
    min: '0',
    max: '999999999',
    aggregate: definition.aggregate,
    direction: definition.direction,
    period: definition.period,
    timeBasis: 'submittedAt',
  };
}

export function mapDraft(draft: {
  id: string;
  definition: Prisma.JsonValue;
  expiresAt: Date | null;
}): GroupRankDraftDto {
  return {
    id: draft.id,
    template: customTemplate(
      draft.id,
      draft.definition as unknown as GroupRankDefinition,
    ),
    expiresAt: draft.expiresAt?.toISOString() ?? null,
  };
}

export async function findDraft(
  prisma: PrismaService | Prisma.TransactionClient,
  id: string,
  appId: string,
) {
  const draft = await prisma.groupRankDraft.findFirst({ where: { id, appId } });
  if (!draft || (draft.expiresAt && draft.expiresAt.getTime() <= Date.now()))
    throw new NotFoundException('这个玩法草稿已过期，请重新创建');
  return draft;
}

export function definitionKey(definition: GroupRankDefinition) {
  return JSON.stringify([
    definition.entryMode || 'multiple',
    definition.name,
    definition.unit,
    definition.aggregate,
    definition.direction,
    definition.period,
    definition.themeId || 'volt',
    normalizeAccentColor(definition.accentColor),
    definition.background ? normalizeBackground(definition.background) : null,
  ]);
}
