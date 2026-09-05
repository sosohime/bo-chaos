import { describe, expect, it } from 'vitest';
import {
  DAY_MS,
  countdownText,
  retirementSnapshot,
  shanghaiDate,
} from './retirement';

describe('community retirement calendar', () => {
  const target = Date.parse('2028-07-06T00:00:00+08:00');
  const start = Date.parse('2013-07-06T00:00:00+08:00');
  it('converts complete seconds, keeping rollover boundaries exact', () => {
    const value = retirementSnapshot(
      target,
      start,
      target - DAY_MS - 3_661_000,
    );
    expect(countdownText(value)).toBe('1 天 01:01:01');
    expect(retirementSnapshot(target, start, target - 1000).seconds).toBe(1);
    expect(retirementSnapshot(target, start, target - 999).reached).toBe(false);
  });
  it('clamps both ends and stops at the exact target', () => {
    expect(retirementSnapshot(target, start, start - DAY_MS).progress).toBe(0);
    for (const now of [target, target + DAY_MS]) {
      expect(retirementSnapshot(target, start, now)).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        progress: 100,
        reached: true,
      });
    }
  });
  it('uses Shanghai calendar dates even on a UTC build host', () => {
    expect(shanghaiDate(target)).toBe('2028-07-06');
    expect(shanghaiDate(target - 1)).toBe('2028-07-05');
    expect(shanghaiDate(target - 365 * DAY_MS)).toBe('2027-07-07');
    expect(shanghaiDate(target - 100 * DAY_MS)).toBe('2028-03-28');
  });
});
