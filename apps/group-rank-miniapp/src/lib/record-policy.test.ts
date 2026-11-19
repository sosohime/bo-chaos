import { describe, it, expect } from 'vitest';
import { singleRecord } from './record-policy';
import type { GroupRankTemplate } from '@mono/types';
const template = {entryMode:'single',period:'all_time'} as GroupRankTemplate;
const row = (id: string, createdAt: string) => ({id,createdAt,value:'0',revision:1});
describe('single-record edit target', () => {
  it('retains zero and selects original entry rather than append', () => {
    const original = row('a','2026-10-30T00:00:00Z');
    expect(singleRecord(template,[original])).toBe(original);
    expect(singleRecord({...template,entryMode:'multiple'},[original])).toBeNull();
    expect(singleRecord({...template,entryMode:undefined},[original])).toBeNull();
  });
  it('uses the exact Beijing month boundary and ignores old history', () => {
    const old = row('old','2026-10-31T15:59:59Z');
    const current = row('current','2026-10-31T16:00:00Z');
    const month = {...template,period:'month' as const};
    expect(singleRecord(month,[old],new Date('2026-11-15'))).toBeNull();
    expect(singleRecord(month,[old,current],new Date('2026-11-15'))).toBe(current);
  });
});
