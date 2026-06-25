import { QUESTS, SKILLS, questById, skillById, unlockedSkills } from './data';
import type { BattleState, Outcome, Quest, SaveState, Skill } from './types';
import { addLog, clamp, completedNormalCount, spendAction } from './state';

export function startBattle(state: SaveState, questId: string): BattleState {
  const quest = requiredQuest(questId);
  const issueHeat = state.issues.reduce((sum, issue) => sum + issue.severity, 0);
  const failedBoost = state.failed.includes(quest.id) ? 7 : 0;
  const bossBoost = quest.boss ? Math.floor(issueHeat * 0.55) : Math.floor(issueHeat * 0.18);
  const battle: BattleState = {
    questId,
    round: 1,
    phase: 1,
    maxPhase: quest.boss ? 3 : 1,
    client: {
      anger: clamp(quest.initial.anger + failedBoost + bossBoost, 0, 96),
      budget: clamp(quest.initial.budget - Math.floor(bossBoost / 2), 8, 100),
      scope: clamp(quest.initial.scope + failedBoost + bossBoost, 0, 96),
      trust: clamp(quest.initial.trust - failedBoost, 0, 100),
    },
    cooldowns: {},
    log: [`客户：${quest.brief}`],
    outcome: '',
    lastSkill: '',
    intent: '',
  };
  battle.intent = nextClientIntent(battle);
  return battle;
}

export function canStartQuest(state: SaveState, quest: Quest): string {
  if (!quest.unlock(state)) return '这单还没解锁。';
  if (state.completed.includes(quest.id)) return '这单已经结案。';
  if (state.actionPoints < quest.cost) return '今天行动点不够。';
  if (quest.mapId !== state.mapId) return '客户不在当前地图。';
  return '';
}

export function beginQuest(state: SaveState, quest: Quest): BattleState | null {
  const reason = canStartQuest(state, quest);
  if (reason) return null;
  if (!spendAction(state, quest.cost)) return null;
  state.scene = 'battle';
  const battle = startBattle(state, quest.id);
  state.battle = battle;
  if (quest.boss && !state.flags.includes('boss-seen')) state.flags.push('boss-seen');
  return battle;
}

export function usableSkills(state: SaveState, battle: BattleState): Skill[] {
  return battleSkillDeck(state, battle).filter((skill) => !skillDisabled(state, battle, skill));
}

export function skillDisabled(state: SaveState, battle: BattleState, skill: Skill): boolean {
  const resources = state.resources;
  if ((battle.cooldowns[skill.id] || 0) > 0) return true;
  if ((skill.cost.energy || 0) > resources.energy) return true;
  if ((skill.cost.patience || 0) > resources.patience) return true;
  if ((skill.cost.boundary || 0) > resources.boundary) return true;
  if ((skill.cost.cash || 0) > resources.cash) return true;
  return false;
}

export function applySkill(state: SaveState, battle: BattleState, skillId: string): void {
  const quest = requiredQuest(battle.questId);
  const skill = skillById(skillId);
  if (!skill || skillDisabled(state, battle, skill) || battle.outcome) return;
  const training = state.training[skill.training];
  spendSkillCost(state, skill);
  Object.entries(skill.effect).forEach(([key, rawAmount]) => {
    const amount = Number(rawAmount) || 0;
    const bonus = amount === 0 ? 0 : Math.sign(amount) * (training * 3 + (quest.recommended.includes(skill.id) ? 3 : 0));
    battle.client[key as keyof typeof battle.client] = clamp(
      battle.client[key as keyof typeof battle.client] + amount + bonus,
      0,
      100,
    );
  });
  Object.entries(skill.self || {}).forEach(([key, amount]) => {
    const resource = key as keyof typeof state.resources;
    state.resources[resource] = clamp(
      state.resources[resource] + Number(amount || 0),
      0,
      resource === 'cash' ? 99999 : 100,
    );
  });
  state.routes[skill.category] = clamp(state.routes[skill.category] + 5 + training, 0, 100);
  battle.cooldowns[skill.id] = skill.cooldown + 1;
  battle.lastSkill = skill.id;
  battle.log.unshift(`博哥：${skill.intent}`);
  battle.outcome = evaluateBattle(state, battle, quest, 'skill');
  if (!battle.outcome) clientTurn(state, battle, quest);
  tickCooldowns(battle);
  if (!battle.outcome) battle.outcome = evaluateBattle(state, battle, quest, 'client');
  if (!battle.outcome) battle.round += 1;
  battle.intent = nextClientIntent(battle);
  state.battle = battle;
}

export function stabilize(state: SaveState, battle: BattleState): void {
  if (battle.outcome) return;
  state.resources.energy = clamp(state.resources.energy + 8, 0, 100);
  state.resources.patience = clamp(state.resources.patience + 7, 0, 100);
  state.resources.boundary = clamp(state.resources.boundary + 4, 0, 100);
  battle.client.trust = clamp(battle.client.trust + 4, 0, 100);
  battle.client.anger = clamp(battle.client.anger - 4, 0, 100);
  battle.log.unshift('博哥：先稳住场面，不免费硬扛，也不把会聊死。');
  battle.lastSkill = 'stabilize';
  clientTurn(state, battle, requiredQuest(battle.questId));
  tickCooldowns(battle);
  battle.outcome = evaluateBattle(state, battle, requiredQuest(battle.questId), 'client');
  if (!battle.outcome) battle.round += 1;
  battle.intent = nextClientIntent(battle);
  state.battle = battle;
}

export function settleBattle(state: SaveState, battle: BattleState): Outcome {
  const quest = requiredQuest(battle.questId);
  const outcome = battle.outcome || evaluateBattle(state, battle, quest) || 'fail';
  const rewardScale = outcome === 'win' ? 1 : outcome === 'partial' ? 0.56 : -0.22;
  const cashDelta = Math.round(quest.reward * rewardScale);
  const xp = outcome === 'win' ? quest.xp : outcome === 'partial' ? Math.round(quest.xp * 0.62) : 14;
  state.resources.cash = clamp(state.resources.cash + cashDelta, 0, 99999);
  state.xp = clamp(state.xp + xp, 0, 99999);
  state.level = clamp(1 + Math.floor(state.xp / 140), 1, 20);
  state.resources.reputation = clamp(
    state.resources.reputation + (outcome === 'win' ? 8 : outcome === 'partial' ? 2 : -7),
    0,
    100,
  );
  state.resources.pressure = clamp(
    state.resources.pressure + (outcome === 'win' ? -9 : outcome === 'partial' ? 5 : 13),
    0,
    100,
  );
  const recovery =
    outcome === 'win'
      ? { energy: 18, patience: 14, boundary: 6 }
      : outcome === 'partial'
        ? { energy: 12, patience: 10, boundary: 4 }
        : { energy: 8, patience: 8, boundary: 2 };
  state.resources.energy = clamp(state.resources.energy + recovery.energy, 0, 100);
  state.resources.patience = clamp(state.resources.patience + recovery.patience, 0, 100);
  state.resources.boundary = clamp(state.resources.boundary + recovery.boundary, 0, 100);
  state.routes[quest.route] = clamp(state.routes[quest.route] + (outcome === 'win' ? 12 : outcome === 'partial' ? 6 : 2), 0, 100);
  state.failed = state.failed.filter((id) => id !== quest.id);
  if (outcome === 'win' || (outcome === 'partial' && !quest.boss)) {
    if (!state.completed.includes(quest.id)) state.completed.push(quest.id);
  } else {
    if (!state.failed.includes(quest.id)) state.failed.push(quest.id);
    state.issues.unshift({
      id: `${quest.id}-${Date.now()}`,
      sourceQuest: quest.id,
      kind: quest.issue.kind,
      label: quest.issue.label,
      severity: quest.issue.severity,
    });
    state.issues = state.issues.slice(0, 6);
  }
  if (outcome === 'partial') {
    state.issues.unshift({
      id: `${quest.id}-follow-${Date.now()}`,
      sourceQuest: quest.id,
      kind: quest.issue.kind,
      label: `后续：${quest.issue.label}`,
      severity: Math.max(2, Math.floor(quest.issue.severity * 0.45)),
    });
    state.issues = state.issues.slice(0, 6);
  }
  if (quest.boss && outcome === 'win') {
    state.ending = routeEnding(state);
    state.flags.push('boss-cleared');
  }
  state.scene = 'map';
  state.battle = null;
  addLog(
    state,
    `${outcomeLabel(outcome)}：${quest.title}。${outcome === 'win' ? quest.win : outcome === 'partial' ? quest.partial : quest.fail}`,
  );
  return outcome;
}

export function train(state: SaveState, key: keyof SaveState['training']): string {
  if (state.actionPoints <= 0) return '今天行动点不够。';
  const cost = 90 + state.training[key] * 80;
  if (state.resources.cash < cost) return `现金不够，需要 ${cost}。`;
  state.actionPoints -= 1;
  state.resources.cash -= cost;
  state.training[key] = clamp(state.training[key] + 1, 0, 5);
  state.resources.energy = clamp(state.resources.energy - 5, 0, 100);
  state.resources.patience = clamp(state.resources.patience + 6, 0, 100);
  if (key === 'review' && state.issues.length) {
    const issue = state.issues.shift();
    if (issue) addLog(state, `复盘清债：${issue.label} 被拆小了。`);
  }
  addLog(state, `训练：${key} Lv.${state.training[key]}。`);
  return '';
}

export function prep(state: SaveState): string {
  if (state.actionPoints <= 0) return '今天行动点不够。';
  state.actionPoints -= 1;
  state.resources.pressure = clamp(state.resources.pressure - 10, 0, 100);
  state.resources.boundary = clamp(state.resources.boundary + 5, 0, 100);
  state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100);
  reduceWorstIssue(state, 6);
  addLog(state, '准备：博哥把报价、验收、SLA 三张表对齐，压力下降。');
  return '';
}

export function clearIssue(state: SaveState): string {
  if (state.actionPoints <= 0) return '今天行动点不够。';
  if (!state.issues.length) return '现在没有遗留问题，先把客户收明白。';
  state.actionPoints -= 1;
  const issue = reduceWorstIssue(state, 999);
  if (!issue) return '';
  state.resources.pressure = clamp(state.resources.pressure - 8 - Math.floor(issue.severity / 2), 0, 100);
  state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100);
  state.resources.boundary = clamp(state.resources.boundary + 4, 0, 100);
  addLog(state, `清债：${issue.label} 被处理，Boss 少了一笔旧账。`);
  return '';
}

function reduceWorstIssue(state: SaveState, amount: number): SaveState['issues'][number] | null {
  if (!state.issues.length) return null;
  let index = 0;
  state.issues.forEach((issue, i) => {
    if (issue.severity > state.issues[index].severity) index = i;
  });
  const issue = state.issues[index];
  issue.severity -= amount;
  if (issue.severity <= 0) state.issues.splice(index, 1);
  return issue;
}

export function rest(state: SaveState): void {
  const upkeep = Math.max(40, 60 + state.day * 8 - state.resources.reputation);
  state.resources.cash = Math.max(0, state.resources.cash - upkeep);
  state.day += 1;
  state.actionPoints = 3;
  state.resources.energy = clamp(state.resources.energy + 28, 0, 100);
  state.resources.patience = clamp(state.resources.patience + 24, 0, 100);
  state.resources.boundary = clamp(state.resources.boundary + 8, 0, 100);
  state.resources.pressure = clamp(state.resources.pressure - 7 + state.issues.length * 2, 0, 100);
  addLog(state, `DAY ${state.day}：维护成本扣 ${upkeep}，博哥带着旧账继续开门。`);
}

export function recommendedSkillIds(state: SaveState, quest: Quest, battle?: BattleState): string[] {
  const unlocked = unlockedSkills(state);
  const risk = dominantRisk(battle?.client || startBattle(state, quest.id).client);
  const tactical = {
    anger: ['fallback', 'slaExplain', 'contract', 'report', 'review'],
    budget: ['anchor', 'report', 'bundle', 'shadow', 'review'],
    scope: ['contract', 'milestone', 'split', 'fallback', 'shadow'],
    trust: ['poc', 'milestone', 'shadowReview', 'shadow', 'report', 'review'],
  }[risk];
  const bossPlan = quest.boss
    ? battle?.phase === 1
      ? ['report', 'anchor', 'bundle', 'shadow', 'review']
      : battle?.phase === 2
        ? ['poc', 'milestone', 'split', 'review', 'shadowReview']
        : ['contract', 'slaExplain', 'fallback', 'shadowReview', 'review', 'anchor']
    : [];
  const ids = [
    ...bossPlan,
    ...tactical,
    ...quest.recommended,
    ...SKILLS.map((skill) => skill.id),
  ];
  return [...new Set(ids)].filter((id) => unlocked.some((skill) => skill.id === id)).slice(0, 5);
}

export function battleSkillDeck(state: SaveState, battle: BattleState): Skill[] {
  const quest = requiredQuest(battle.questId);
  const unlocked = unlockedSkills(state);
  const byId = new Map(unlocked.map((skill) => [skill.id, skill]));
  const ids = [
    ...recommendedSkillIds(state, quest, battle),
    ...state.equippedSkills,
    ...quest.recommended,
    ...unlocked.map((skill) => skill.id),
  ];
  return [...new Set(ids)].map((id) => byId.get(id)).filter(Boolean) as Skill[];
}

export function playRecommendedBattle(input: SaveState, questId: string): { state: SaveState; outcome: Outcome; actions: string[] } {
  const state = JSON.parse(JSON.stringify(input)) as SaveState;
  const quest = requiredQuest(questId);
  if (!spendAction(state, quest.cost)) {
    throw new Error(`Cannot start quest: ${questId}`);
  }
  const battle = startBattle(state, questId);
  const actions: string[] = [];
  let guard = 0;
  while (!battle.outcome && guard < 12) {
    const usable = usableSkills(state, battle);
    const skill = recommendedSkillIds(state, quest, battle)
      .map((id) => usable.find((item) => item.id === id))
      .find(Boolean);
    if (skill) {
      actions.push(skill.id);
      applySkill(state, battle, skill.id);
    } else {
      actions.push('stabilize');
      stabilize(state, battle);
    }
    guard += 1;
  }
  battle.outcome ||= evaluateBattle(state, battle, quest) || 'fail';
  const outcome = settleBattle(state, battle);
  return { state, outcome, actions };
}

function clientTurn(state: SaveState, battle: BattleState, quest: Quest): void {
  const risk = dominantRisk(battle.client);
  const issueBonus = Math.min(9, Math.floor(state.issues.reduce((sum, issue) => sum + issue.severity, 0) / 6));
  const earlyShield = quest.chapter === 1 && completedNormalCount(state) < 2 ? 0.55 : quest.chapter === 1 ? 0.74 : quest.boss ? 1.15 : 1;
  const n = (value: number) => Math.ceil(value * earlyShield);
  const changes = {
    anger: { anger: n(10 + issueBonus), trust: -6, patience: -n(7) },
    budget: { budget: -n(12 + issueBonus), anger: 4, energy: -n(5) },
    scope: { scope: n(13 + issueBonus), trust: -4, patience: -n(5) },
    trust: { trust: -n(9), scope: n(5), energy: -n(5), pressure: n(3) },
  }[risk];
  Object.entries(changes).forEach(([key, amount]) => {
    if (key in battle.client) {
      battle.client[key as keyof typeof battle.client] = clamp(
        battle.client[key as keyof typeof battle.client] + amount,
        0,
        100,
      );
    } else {
      const resource = key as keyof typeof state.resources;
      state.resources[resource] = clamp(state.resources[resource] + amount, 0, resource === 'cash' ? 99999 : 100);
    }
  });
  battle.log.unshift(clientLine(risk));
}

function evaluateBattle(state: SaveState, battle: BattleState, quest: Quest, source: 'skill' | 'client' = 'client'): Outcome | '' {
  const c = battle.client;
  const hardFail =
    state.resources.energy <= 0 ||
    state.resources.patience <= 0 ||
    c.anger >= 100 ||
    c.scope >= 100 ||
    c.budget <= 0;
  if (hardFail) {
    if (quest.chapter === 1 && completedNormalCount(state) < 2 && battle.round < 4 && !battle.log.some((line) => line.includes('教学保护'))) {
      state.resources.energy = Math.max(state.resources.energy, 18);
      state.resources.patience = Math.max(state.resources.patience, 18);
      c.anger = Math.min(c.anger, 88);
      c.scope = Math.min(c.scope, 88);
      c.budget = Math.max(c.budget, 18);
      battle.log.unshift('教学保护：这次先不死局，系统把风险摊给你看。');
      return '';
    }
    return 'fail';
  }
  const minWinRound = quest.boss ? 5 : quest.chapter === 1 ? 3 : 4;
  if (quest.boss && source === 'skill' && winsQuest(state, battle, quest)) {
    if (battle.phase < battle.maxPhase) {
      advanceBossPhase(state, battle, quest);
      return '';
    }
    if (battle.round >= minWinRound) return 'win';
  }
  if (battle.round >= minWinRound && winsQuest(state, battle, quest)) return 'win';
  if (battle.round >= 6) {
    if (partiallyWinsQuest(state, battle, quest)) return 'partial';
    return 'fail';
  }
  return '';
}

function winsQuest(state: SaveState, battle: BattleState, quest: Quest): boolean {
  const c = battle.client;
  const boundaryOk = state.resources.boundary >= (quest.chapter === 1 ? 30 : 34);
  if (quest.id === 'gpu') return c.budget >= 55 && c.trust >= 50 && c.anger <= 88;
  if (quest.id === 'agent') return c.scope <= 60 && c.trust >= 54 && c.anger <= 86;
  if (quest.id === 'sla') return c.anger <= 58 && c.scope <= 74 && boundaryOk && c.budget >= 26;
  if (quest.id === 'compliance') return c.scope <= 54 && c.budget >= 38 && boundaryOk;
  if (quest.id === 'cost') return c.budget >= 56 && c.trust >= 46 && c.scope <= 82;
  if (quest.id === 'shadow') return c.trust >= 62 && c.scope <= 62 && c.budget >= 36;
  if (quest.boss) {
    if (battle.phase === 1) return c.budget >= 54 && c.trust >= 46 && c.anger <= 92;
    if (battle.phase === 2) return c.trust >= 64 && c.scope <= 72 && c.budget >= 30;
    return c.anger <= 82 && c.scope <= 78 && c.budget >= 32 && state.resources.boundary >= 38;
  }
  if (quest.id === 'meeting') return c.trust >= 62 && c.scope <= 62 && state.resources.pressure <= 86;
  if (quest.id === 'rival') return c.budget >= 54 && c.trust >= 50 && c.anger <= 88;
  return c.trust >= 62 && c.budget >= 46 && c.anger <= 88 && c.scope <= 86;
}

function partiallyWinsQuest(state: SaveState, battle: BattleState, quest: Quest): boolean {
  const c = battle.client;
  if (c.anger >= 100 || c.scope >= 100 || c.budget <= 0) return false;
  if (quest.id === 'gpu') return c.budget >= 36 && c.trust >= 34;
  if (quest.id === 'agent') return c.scope <= 84 && c.trust >= 36;
  if (quest.id === 'sla') return c.anger <= 86 && state.resources.boundary >= 18;
  if (quest.id === 'compliance') return c.scope <= 86 && c.budget >= 24;
  if (quest.id === 'cost') return c.budget >= 34 || c.trust >= 42;
  if (quest.id === 'shadow') return c.trust >= 46 && c.scope <= 86;
  if (quest.id === 'meeting') return c.trust >= 44 && c.scope <= 84;
  if (quest.id === 'rival') return c.budget >= 34 && c.trust >= 38;
  if (quest.boss) return c.trust >= 52 && c.budget >= 24 && c.anger < 96 && c.scope < 96;
  return c.trust >= 40 && c.budget >= 26;
}

function advanceBossPhase(state: SaveState, battle: BattleState, quest: Quest): void {
  battle.phase += 1;
  battle.round += 1;
  const phaseName = quest.bossPhase?.[battle.phase - 1] || `第 ${battle.phase} 阶段`;
  const oldDebt = Math.min(14, state.issues.reduce((sum, issue) => sum + issue.severity, 0));
  battle.client = {
    anger: clamp(42 + oldDebt + battle.phase * 6, 0, 96),
    budget: clamp(52 - Math.floor(oldDebt / 2), 10, 100),
    scope: clamp(58 + oldDebt, 0, 96),
    trust: clamp(46 + state.level * 2, 0, 100),
  };
  battle.cooldowns = {};
  battle.log.unshift(`验收组翻页：进入「${phaseName}」。旧账越少，这关越好打。`);
  battle.intent = nextClientIntent(battle);
}

function spendSkillCost(state: SaveState, skill: Skill): void {
  Object.entries(skill.cost).forEach(([key, amount]) => {
    const resource = key as keyof typeof state.resources;
    state.resources[resource] = clamp(
      state.resources[resource] - Number(amount || 0),
      0,
      resource === 'cash' ? 99999 : 100,
    );
  });
}

function tickCooldowns(battle: BattleState): void {
  Object.keys(battle.cooldowns).forEach((id) => {
    battle.cooldowns[id] = Math.max(0, battle.cooldowns[id] - 1);
  });
}

function dominantRisk(client: BattleState['client']): 'anger' | 'budget' | 'scope' | 'trust' {
  const entries: Array<['anger' | 'budget' | 'scope' | 'trust', number]> = [
    ['anger', client.anger],
    ['budget', 100 - client.budget],
    ['scope', client.scope],
    ['trust', 100 - client.trust],
  ];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function clientLine(risk: ReturnType<typeof dominantRisk>): string {
  return {
    anger: '客户：你们是不是不想负责？',
    budget: '客户：这块不是默认的吗，怎么还要钱？',
    scope: '客户：那顺手再接一个系统吧。',
    trust: '客户：你先证明这个方案真能落地。',
  }[risk];
}

function nextClientIntent(battle: BattleState): string {
  const risk = dominantRisk(battle.client);
  return {
    anger: '追责：下回合怒气和压力会上升',
    budget: '砍价：下回合预算继续下滑',
    scope: '加需求：下回合需求蔓延扩大',
    trust: '追案例：下回合信任下降并消耗体力',
  }[risk];
}

function routeEnding(state: SaveState): string {
  const route = Object.entries(state.routes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'delivery';
  return {
    business: '商业封神线：免费售后被改造成报价阶梯。',
    delivery: '交付稳态线：每个满意都能落到验收清单。',
    boundary: '边界宗师线：群聊不再替合同开庭。',
    shadow: '影流三案线：客户选得开心，博哥收得明白。',
  }[route as keyof SaveState['routes']];
}

function outcomeLabel(outcome: Outcome): string {
  return outcome === 'win' ? '胜利' : outcome === 'partial' ? '部分成功' : '失败';
}

function requiredQuest(id: string): Quest {
  const quest = questById(id);
  if (!quest) throw new Error(`Unknown quest: ${id}`);
  return quest;
}

export function allQuestIds(): string[] {
  return QUESTS.map((quest) => quest.id);
}
