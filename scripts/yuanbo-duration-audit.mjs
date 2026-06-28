#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const prologue = readFileSync(
  'apps/frontend-astro/src/game/yuanbo/prologue.ts',
  'utf8',
);
const browserProbe = readFileSync(
  'scripts/yuanbo-prologue-browser-probe.mjs',
  'utf8',
);

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const count = (needle, text = prologue) =>
  (text.match(new RegExp(escapeRegExp(needle), 'g')) || []).length;

const storyBeatBlock = sliceBetween('const STORY_BEATS', 'const SCENE_CUES');
const evidenceBlock = sliceBetween('const EVIDENCE_OPTIONS', 'const PREP_OPTIONS');
const prepBlock = sliceBetween('const PREP_OPTIONS', 'export function startYuanboGame');
const milestoneBlock = sliceBetween('const MILESTONES', 'const BEAT_MILESTONE');

const storyBeats = count('act:', storyBeatBlock);
const evidenceCards = count('id:', evidenceBlock);
const prepActions = count('id:', prepBlock);
const milestoneCount = count('label:', milestoneBlock);
const choiceLabels = count("label: '");
const routeRuns = count("await runPage('route-", browserProbe);
const browserModes =
  count("await runPage('desktop'", browserProbe) +
  count("await runPage('mobile'", browserProbe) +
  count("await runPage('tradeoff'", browserProbe) +
  count("await runPage('debt'", browserProbe);

// This is a content-volume proxy, not a stopwatch. It is intentionally
// conservative and forces enough authored beats, choices, and battle surface
// for a 25-35 minute first playthrough target.
const estimatedMinutes =
  storyBeats * 1.2 +
  Math.min(9, evidenceCards) * 0.7 +
  prepActions * 0.9 +
  9 * 0.65 +
  milestoneCount * 0.45 +
  Math.min(choiceLabels, 60) * 0.04;

check(storyBeats >= 9, `expected 9 story beat cards, got ${storyBeats}`);
check(milestoneCount >= 6, `expected 6 chapter milestones, got ${milestoneCount}`);
check(evidenceCards >= 9, `expected at least 9 authored evidence/prep entries, got ${evidenceCards}`);
check(prepActions >= 3, `expected 3 prep actions, got ${prepActions}`);
check(choiceLabels >= 50, `expected at least 50 interactive labels, got ${choiceLabels}`);
check(routeRuns >= 4, `expected 4 ending route probes, got ${routeRuns}`);
check(browserModes >= 4, `expected desktop/mobile/tradeoff/debt browser probes, got ${browserModes}`);
check(
  estimatedMinutes >= 25 && estimatedMinutes <= 35,
  `estimated first-play content should be 25-35 minutes, got ${estimatedMinutes.toFixed(1)}`,
);

if (failures.length) {
  console.error('yuanbo duration audit failed');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `yuanbo duration audit passed: estimate=${estimatedMinutes.toFixed(
    1,
  )}min, beats=${storyBeats}, milestones=${milestoneCount}, labels=${choiceLabels}`,
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sliceBetween(start, end) {
  const startAt = prologue.indexOf(start);
  const endAt = prologue.indexOf(end, startAt + start.length);
  if (startAt < 0 || endAt < 0) return '';
  return prologue.slice(startAt, endAt);
}
