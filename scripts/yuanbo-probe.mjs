#!/usr/bin/env node
import { createJiti } from 'jiti';

const jiti = createJiti(`${process.cwd()}/`);
const { QUESTS, SKILLS } = jiti('./apps/frontend-astro/src/game/yuanbo/data.ts');
const { clamp, defaultState, levelUp } = jiti(
  './apps/frontend-astro/src/game/yuanbo/state.ts',
);

const MAX_ACTIONS = 12;

function skillSlots(state) {
  if (state.level >= 5 || state.cycle >= 2) return 6;
  if (state.level >= 3) return 5;
  return 4;
}

function skillUnlocked(state, skill) {
  if (skill.unlockLevel <= state.level) return true;
  if (!skill.training) return false;
  return state.training[skill.training] >= Math.max(1, skill.unlockLevel - 1);
}

function sortedUnlockedSkills(state, quest) {
  return SKILLS.filter((skill) => skillUnlocked(state, skill)).sort((a, b) => {
    const score = (skill) => {
      let value = 0;
      if (quest?.preferred?.includes(skill.training)) value += 40;
      if (skill.category === quest?.route) value += 18;
      if (skill.training) value += state.training[skill.training] * 4;
      value += skill.unlockLevel;
      return value;
    };
    return score(b) - score(a);
  });
}

function battleSkills(state, quest) {
  return sortedUnlockedSkills(state, quest).slice(0, skillSlots(state));
}

function makePreparedState(quest) {
  const state = defaultState();
  state.storyIntroSeen = true;
  state.level = Math.max(1, quest.recommendedLevel);
  state.stats.cash = 760;
  state.stats.reputation = 48;
  state.stats.energy = 94;
  state.stats.patience = 92;
  state.stats.boundary = 62;
  state.stats.pressure = quest.chapter >= 3 ? 34 : 18;
  Object.keys(state.training).forEach((key) => {
    state.training[key] = quest.chapter >= 3 ? 2 : quest.chapter >= 2 ? 1 : 0;
  });
  if (quest.boss) {
    state.level = 4;
    state.completed = QUESTS.filter((item) => !item.boss)
      .slice(0, 6)
      .map((item) => item.id);
    state.routes.business = 45;
    state.routes.delivery = 38;
    state.routes.boundary = 42;
    state.routes.shadow = 28;
  }
  return state;
}

function initBattle(state, quest) {
  const issueHeat = state.issues.reduce((sum, issue) => sum + issue.severity, 0);
  const failedBoost = state.failed.includes(quest.id) ? 8 : 0;
  const cycleBoost = Math.max(0, state.cycle - 1) * 5;
  const bossBoost = quest.boss
    ? Math.floor(issueHeat * 0.48)
    : Math.floor(issueHeat * 0.18);
  return {
    questId: quest.id,
    round: 1,
    client: {
      anger: clamp(quest.enemy.anger + failedBoost + bossBoost + cycleBoost, 0, 96),
      budget: clamp(
        quest.enemy.budget - Math.floor(bossBoost / 2) - cycleBoost,
        8,
        100,
      ),
      scope: clamp(quest.enemy.scope + failedBoost + bossBoost + cycleBoost, 0, 96),
      trust: clamp(quest.enemy.trust - failedBoost, 0, 100),
    },
    cooldowns: {},
    flags: [],
    log: [],
  };
}

function skillDisabled(state, battle, skill) {
  if (!skillUnlocked(state, skill)) return true;
  if ((battle.cooldowns[skill.id] || 0) > 0) return true;
  if (state.stats.energy < skill.energy || state.stats.patience < skill.patience)
    return true;
  if (skill.boundary && state.stats.boundary < skill.boundary) return true;
  if (
    skill.category === 'shadow' &&
    state.training.shadow <= 0 &&
    state.level < skill.unlockLevel
  )
    return true;
  return false;
}

function usableSkills(state, battle, quest) {
  return battleSkills(state, quest).filter((skill) => !skillDisabled(state, battle, skill));
}

function applySkill(state, battle, quest, skill) {
  state.stats.energy = clamp(state.stats.energy - skill.energy, 0, 100);
  state.stats.patience = clamp(state.stats.patience - skill.patience, 0, 100);
  if (skill.boundary)
    state.stats.boundary = clamp(state.stats.boundary - skill.boundary, 0, 100);
  const trainingBonus = skill.training ? state.training[skill.training] : 0;
  Object.entries(skill.effect).forEach(([key, amount]) => {
    const direction = amount > 0 ? 1 : -1;
    const preferredBonus = skill.training && quest.preferred?.includes(skill.training) ? 3 : 0;
    const resistance = quest.resistance?.[key] || 0;
    battle.client[key] = clamp(
      battle.client[key] + amount + direction * (trainingBonus * 3 + preferredBonus - resistance),
      0,
      100,
    );
  });
  Object.entries(skill.self || {}).forEach(([key, amount]) => {
    state.stats[key] = clamp(state.stats[key] + amount, 0, key === 'cash' ? 99999 : 100);
  });
  state.routes[skill.category] = clamp(state.routes[skill.category] + 4 + trainingBonus, 0, 100);
  battle.cooldowns[skill.id] = skill.cooldown + 1;
}

function clientTurn(state, battle, quest) {
  const c = battle.client;
  const highest = Object.entries({
    anger: c.anger,
    budget: 100 - c.budget,
    scope: c.scope,
    trust: 100 - c.trust,
  }).sort((a, b) => b[1] - a[1])[0][0];
  const issueBonus = Math.min(9, state.issues.reduce((sum, issue) => sum + issue.severity, 0) / 6);
  const earlyProtection =
    quest.chapter === 1 && state.completed.filter((id) => id !== 'boss').length < 2
      ? 0.55
      : quest.chapter === 1
        ? 0.75
        : 1;
  const s = (value) => Math.ceil(value * earlyProtection);
  const effects = {
    anger: { client: { anger: s(10 + issueBonus), trust: -6 }, self: { patience: -s(7) } },
    budget: { client: { budget: -s(12 + issueBonus), anger: 5 }, self: { energy: -s(5) } },
    scope: { client: { scope: s(13 + issueBonus), trust: -4 }, self: { patience: -s(5) } },
    trust: { client: { trust: -s(9), scope: s(6) }, self: { energy: -s(5), pressure: s(4) } },
  }[highest];
  Object.entries(effects.client).forEach(([key, amount]) => {
    c[key] = clamp(c[key] + amount, 0, 100);
  });
  Object.entries(effects.self).forEach(([key, amount]) => {
    state.stats[key] = clamp(state.stats[key] + amount, 0, 100);
  });
}

function stabilize(state, battle) {
  state.stats.energy = clamp(state.stats.energy + 7, 0, 100);
  state.stats.patience = clamp(state.stats.patience + 7, 0, 100);
  state.stats.boundary = clamp(state.stats.boundary + 4, 0, 100);
  state.stats.pressure = clamp(state.stats.pressure - 2, 0, 100);
  battle.client.trust = clamp(battle.client.trust + 3, 0, 100);
  battle.client.anger = clamp(battle.client.anger - 3, 0, 100);
  battle.client.budget = clamp(battle.client.budget - 3, 0, 100);
}

function evaluate(state, battle, quest) {
  const c = battle.client;
  const hardFail =
    state.stats.energy <= 0 ||
    state.stats.patience <= 0 ||
    c.anger >= 100 ||
    c.scope >= 100 ||
    c.budget <= 0;
  if (hardFail) {
    const earlyCompleted = state.completed.filter((id) => id !== 'boss').length;
    if (
      quest.chapter === 1 &&
      earlyCompleted < 2 &&
      battle.round < 4 &&
      !battle.flags.includes('tutorial-buffer')
    ) {
      battle.flags.push('tutorial-buffer');
      state.stats.energy = Math.max(state.stats.energy, 18);
      state.stats.patience = Math.max(state.stats.patience, 18);
      c.anger = Math.min(c.anger, 88);
      c.scope = Math.min(c.scope, 88);
      c.budget = Math.max(c.budget, 18);
      return '';
    }
    return 'fail';
  }
  if (c.trust >= 70 && c.budget >= 50 && c.anger <= 88 && c.scope <= 84)
    return 'win';
  if (battle.round >= 6) {
    if (c.trust >= 44 && c.budget >= 30 && c.anger < 100) return 'partial';
    return 'fail';
  }
  return '';
}

function settle(state, quest, outcome) {
  if (outcome === 'win' || outcome === 'partial') {
    if (!quest.boss || outcome === 'win') state.completed.push(quest.id);
    state.failed = state.failed.filter((id) => id !== quest.id);
  } else if (!state.failed.includes(quest.id)) {
    state.failed.push(quest.id);
  }
  state.xp += outcome === 'win' ? quest.xp : outcome === 'partial' ? Math.floor(quest.xp * 0.62) : 12;
  state.stats.cash = Math.max(
    0,
    state.stats.cash +
      (outcome === 'win' ? quest.reward : outcome === 'partial' ? Math.floor(quest.reward * 0.58) : -80),
  );
  if (!quest.boss)
    state.routes[quest.route] = clamp(
      state.routes[quest.route] + (outcome === 'win' ? 14 : outcome === 'partial' ? 8 : 2),
      0,
      100,
    );
  levelUp(state);
}

function pickSkill(strategy, state, battle, quest, actionIndex) {
  const usable = usableSkills(state, battle, quest);
  if (!usable.length) return null;
  if (strategy === 'bad') return usable[usable.length - 1];
  if (strategy === 'drain') return [...usable].sort((a, b) => b.energy + b.patience - (a.energy + a.patience))[0];
  if (strategy === 'first') return usable[0];
  const byPlan = quest.preferred
    ? usable.find((skill) => quest.preferred.includes(skill.training))
    : undefined;
  return byPlan || usable[actionIndex % usable.length];
}

function runBattle(quest, strategy) {
  const state = makePreparedState(quest);
  const battle = initBattle(state, quest);
  let fallbackCount = 0;
  for (let i = 0; i < MAX_ACTIONS; i += 1) {
    const before = evaluate(state, battle, quest);
    if (before) {
      settle(state, quest, before);
      return { outcome: before, actions: i, fallbackCount };
    }
    const skill = pickSkill(strategy, state, battle, quest, i);
    if (skill) applySkill(state, battle, quest, skill);
    else {
      fallbackCount += 1;
      stabilize(state, battle);
    }
    const early = evaluate(state, battle, quest);
    if (early) {
      settle(state, quest, early);
      return { outcome: early, actions: i + 1, fallbackCount };
    }
    clientTurn(state, battle, quest);
    Object.keys(battle.cooldowns).forEach((id) => {
      battle.cooldowns[id] = Math.max(0, battle.cooldowns[id] - 1);
    });
    battle.round += 1;
    const after = evaluate(state, battle, quest);
    if (after) {
      settle(state, quest, after);
      return { outcome: after, actions: i + 1, fallbackCount };
    }
  }
  throw new Error(`${quest.id}/${strategy} did not settle in ${MAX_ACTIONS} actions`);
}

function runCampaign() {
  const state = defaultState();
  const order = ['gpu', 'agent', 'sla', 'private', 'cost', 'shadow', 'boss'];
  for (const id of order) {
    const quest = QUESTS.find((item) => item.id === id);
    if (!quest) throw new Error(`missing campaign quest ${id}`);
    if (!quest.unlock(state)) {
      state.level = Math.max(state.level, quest.recommendedLevel);
      Object.keys(state.training).forEach((key) => {
        state.training[key] = Math.max(state.training[key], quest.chapter >= 2 ? 1 : 0);
      });
      state.routes[quest.route] = Math.max(state.routes[quest.route], quest.chapter >= 3 ? 45 : 18);
    }
    const result = runBattle(quest, 'recommended');
    settle(state, quest, result.outcome);
  }
  if (!state.completed.includes('boss')) throw new Error('campaign did not complete boss');
}

const failures = [];
const strategies = ['recommended', 'bad', 'drain', 'first'];
for (const quest of QUESTS) {
  for (const strategy of strategies) {
    try {
      const result = runBattle(quest, strategy);
      console.log(`${quest.id.padEnd(10)} ${strategy.padEnd(11)} -> ${result.outcome} in ${result.actions} actions fallback=${result.fallbackCount}`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
}
try {
  runCampaign();
  console.log('campaign   recommended -> boss completed');
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

if (failures.length) {
  console.error('\nYuanbo probe failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
