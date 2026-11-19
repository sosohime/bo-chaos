import type { GroupRankTemplate } from '@mono/types';
import { ConflictException } from '@nestjs/common';
import { periodStart } from './templates';

export function singleRecordScope(template: GroupRankTemplate) {
  const start = periodStart(template);
  return start ? { createdAt: { gte: start } } : {};
}

// Claim transfers original submission times. Validate every affected period, not only today.
export function assertSingleClaim(template: GroupRankTemplate, entries: { createdAt: Date }[]) {
  if (template.entryMode !== 'single') return;
  const periods = new Set<string>();
  for (const entry of entries) {
    const key = periodStart(template, entry.createdAt)?.toISOString() || 'all';
    if (periods.has(key)) throw new ConflictException('同一期只能记一笔，已有成绩与认领记录冲突。请先核对要保留哪一笔。');
    periods.add(key);
  }
}
