#!/usr/bin/env node
import { createJiti } from 'jiti';

const jiti = createJiti(`${process.cwd()}/`);
const { QUESTS } = jiti('./apps/frontend-astro/src/game/yuanbo-pixi/data.ts');
const { defaultState, normalizeState, setActionPoints } = jiti(
  './apps/frontend-astro/src/game/yuanbo-pixi/state.ts',
);
const { playRecommendedBattle, train, prep, rest } = jiti(
  './apps/frontend-astro/src/game/yuanbo-pixi/sim.ts',
);

const PLACEHOLDER_RE = /TODO|FIXME|placeholder|占位|临时文案|lorem/i;

function clone(value) {
  return normalizeState(JSON.parse(JSON.stringify(value)));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function textOf(quest) {
  return [
    quest.title,
    quest.client,
    quest.risk,
    quest.brief,
    quest.objective,
    quest.win,
    quest.partial,
    quest.fail,
  ].join('\n');
}

function preparedState(quest) {
  const state = defaultState();
  state.mapId = quest.mapId;
  state.actionPoints = 3;
  state.resources.cash = 900;
  state.resources.energy = 94;
  state.resources.patience = 92;
  state.resources.boundary = 70;
  state.resources.reputation = 52;
  state.training.pricing = quest.chapter >= 2 ? 1 : 0;
  state.training.delivery = quest.chapter >= 2 ? 1 : 0;
  state.training.sla = quest.chapter >= 2 ? 1 : 0;
  state.training.review = quest.chapter >= 2 ? 1 : 0;
  state.training.shadow = quest.route === 'shadow' || quest.boss ? 1 : 0;
  if (quest.chapter >= 2 || quest.boss) state.completed = ['gpu', 'agent', 'sla'];
  if (quest.boss) state.completed = ['gpu', 'agent', 'sla', 'compliance'];
  return state;
}

const rows = [];
for (const quest of QUESTS) {
  assert(!PLACEHOLDER_RE.test(textOf(quest)), `${quest.id} contains placeholder text`);
  assert(quest.objective.length >= 16, `${quest.id} objective is too vague`);
  const result = playRecommendedBattle(preparedState(quest), quest.id);
  rows.push(`${quest.id.padEnd(11)} -> ${result.outcome.padEnd(7)} actions=${result.actions.join(',')}`);
  assert(result.actions.length <= 12, `${quest.id} did not settle`);
}

let campaign = defaultState();
const campaignOrder = ['gpu', 'agent', 'sla', 'compliance', 'cost', 'boss'];
for (const id of campaignOrder) {
  const quest = QUESTS.find((item) => item.id === id);
  assert(quest, `missing ${id}`);
  const ensureAction = (cost = 1) => {
    if (campaign.actionPoints < cost) rest(campaign);
  };
  campaign.mapId = quest.mapId;
  if (id === 'compliance') {
    campaign.resources.cash += 240;
    ensureAction();
    train(campaign, 'sla');
    ensureAction(quest.cost);
  }
  if (id === 'cost') {
    campaign.resources.cash += 240;
    ensureAction();
    train(campaign, 'pricing');
    ensureAction(quest.cost);
  }
  if (id === 'boss') {
    campaign.resources.cash += 300;
    ensureAction();
    train(campaign, 'delivery');
    ensureAction();
    train(campaign, 'shadow');
    ensureAction();
    prep(campaign);
    ensureAction(quest.cost);
    campaign.mapId = 'site';
  }
  ensureAction(quest.cost);
  const result = playRecommendedBattle(campaign, id);
  campaign = clone(result.state);
  rows.push(`campaign ${id.padEnd(6)} -> ${result.outcome}`);
  assert(result.outcome !== 'fail', `campaign failed at ${id}`);
}

assert(campaign.completed.includes('boss'), 'campaign did not complete boss');
assert(campaign.ending, 'campaign did not produce ending');

console.log(rows.join('\n'));
console.log(`campaign completed: ${campaign.ending}`);
