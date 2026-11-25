import { normalizeBackground } from './background-contract';
import { definitionKey } from './definitions';
import type { GroupRankDefinition } from '@mono/types';

const background = {
  assetId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  cover: { x: .5, y: .5, zoom: 1 },
  card: { x: .6140602588203285, y: .27180687166458275, zoom: 1.33 },
  dim: .47,
};
const definition: GroupRankDefinition = {
  name: '背景验收', unit: '分', aggregate: 'latest', direction: 'desc', period: 'all_time',
  background,
};

it('gives drag coordinates a stable key across JSON/database floating-point round trips', () => {
  const stored = { ...definition, background: { ...background, card: { ...background.card, x: .6140602588203286, y: .2718068716645827 } } };
  expect(definitionKey(stored)).toBe(definitionKey(definition));
  expect(normalizeBackground(background)?.card.y).toBe(.271807);
});

it('still detects a meaningful crop change on the same save request', () => {
  expect(definitionKey({ ...definition, background: { ...background, card: { ...background.card, x: .62 } } })).not.toBe(definitionKey(definition));
});

it.each([
  { ...background, card: { ...background.card, x: 1.0000001 } },
  { ...background, card: { ...background.card, zoom: .9999999 } },
  { ...background, dim: .2499999 },
])('rejects out-of-range values before rounding', (input) => {
  expect(() => normalizeBackground(input)).toThrow('背景');
});
