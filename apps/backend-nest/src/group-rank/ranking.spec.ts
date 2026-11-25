import { Prisma } from '@mono/prisma-client';
import { getOfficialTemplate, periodStart, validateScore } from './templates';
import { rankScores } from './ranking';

describe('official ranking semantics', () => {
  it('uses competition ranks and stable display ordering without breaking ties', () => {
    const scores = [
      ['d', '80'],
      ['c', '90'],
      ['b', '90'],
      ['a', '100'],
    ].map(([userId, value]) => ({ userId, score: new Prisma.Decimal(value) }));
    const result = rankScores(scores, getOfficialTemplate('game-score'));
    expect(result.map((row) => [row.userId, row.rank])).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 2],
      ['d', 4],
    ]);
  });
  it('preserves decimal equality and cumulative precision', () => {
    const score = new Prisma.Decimal('0.1').plus('0.2');
    const result = rankScores(
      [
        { userId: 'a', score },
        { userId: 'b', score: new Prisma.Decimal('0.30') },
      ],
      getOfficialTemplate('running-distance'),
    );
    expect(result.map((row) => [row.score, row.rank])).toEqual([
      ['0.30', 1],
      ['0.30', 1],
    ]);
  });
  it.each(['-1', 'NaN', 'Infinity', '1e3', '1.234', '0', '1001'])(
    'rejects invalid running score %s',
    (value) => {
      expect(() =>
        validateScore(value, getOfficialTemplate('running-distance')),
      ).toThrow();
    },
  );
  it('rejects fractional counts and accepts zero for integer scores', () => {
    expect(() =>
      validateScore('1.5', getOfficialTemplate('pull-ups')),
    ).toThrow();
    expect(validateScore('0', getOfficialTemplate('pull-ups')).toString()).toBe(
      '0',
    );
  });
  it('rolls the month at midnight in Shanghai, including year rollover', () => {
    const template = getOfficialTemplate('running-distance');
    expect(
      periodStart(template, new Date('2026-10-31T15:59:59Z'))?.toISOString(),
    ).toBe('2026-09-30T16:00:00.000Z');
    expect(
      periodStart(template, new Date('2026-10-31T16:00:00Z'))?.toISOString(),
    ).toBe('2026-10-31T16:00:00.000Z');
    expect(
      periodStart(template, new Date('2026-12-31T16:00:00Z'))?.toISOString(),
    ).toBe('2026-12-31T16:00:00.000Z');
    expect(periodStart(getOfficialTemplate('game-score'))).toBeUndefined();
  });
});
