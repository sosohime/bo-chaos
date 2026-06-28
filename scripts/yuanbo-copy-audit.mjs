#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const prologue = readFileSync(
  'apps/frontend-astro/src/game/yuanbo/prologue.ts',
  'utf8',
);

const bannedTerms = [
  ['案卷', 'use 资料'],
  ['售后债', 'use 遗留问题'],
  ['POC', 'use 小范围试点'],
  ['全量', 'use 全部'],
  ['回旋镖', 'use 反过来追责 / 回来找他'],
  ['蔓延', 'use 变多'],
  ['玄学', 'use 说不清'],
  ['裸奔', 'use 没证据'],
  ['陪跑', 'use 跟进'],
  ['封顶', 'use 有上限'],
  ['口径', 'use 说法'],
  ['预案', 'use 退路'],
  ['报价落表', 'use 报价上桌'],
  ['素材仓库', 'remove debug-like placeholder copy'],
];

const failures = bannedTerms
  .filter(([term]) => prologue.includes(term))
  .map(([term, hint]) => `${term}: ${hint}`);

if (failures.length) {
  console.error('yuanbo copy audit failed: confusing or placeholder terms remain');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const requiredPlainTerms = [
  '收费说法',
  '失败退路',
  '价格没说清',
  '小范围试点',
  '遗留问题',
  '报价上桌',
];
const missing = requiredPlainTerms.filter((term) => !prologue.includes(term));
if (missing.length) {
  console.error('yuanbo copy audit failed: expected plain-language replacements missing');
  missing.forEach((term) => console.error(`- ${term}`));
  process.exit(1);
}

console.log(
  `yuanbo copy audit passed: banned=${bannedTerms.length}, plainTerms=${requiredPlainTerms.length}`,
);
