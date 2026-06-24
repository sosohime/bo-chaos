import type { Issue, MapId, PerkId, SaveState, TrainingKey } from './types';

export const STORAGE_KEY = 'bo-chaos:yuanbo-management-rpg:v3';
export const SAVE_PREFIX = 'YBRPG3:';

export function defaultState(): SaveState {
  return {
    version: 3,
    day: 1,
    cycle: 1,
    chapter: 1,
    level: 1,
    xp: 0,
    actionPoints: 3,
    mapId: 'office',
    player: {
      office: { x: 232, y: 318 },
      clientSite: { x: 126, y: 316 },
    },
    stats: {
      cash: 260,
      reputation: 34,
      energy: 92,
      patience: 88,
      boundary: 56,
      pressure: 18,
    },
    training: {
      pricing: 0,
      delivery: 0,
      sla: 0,
      recovery: 0,
      shadow: 0,
    },
    routes: {
      business: 0,
      delivery: 0,
      boundary: 0,
      shadow: 0,
    },
    completed: [],
    failed: [],
    issues: [],
    locks: {},
    relationships: {},
    storyFlags: [],
    achievements: [],
    perks: [],
    claimedRewards: [],
    equippedSkills: [],
    weeklyGoalId: '',
    contractStanceId: 'standard',
    weeklyGoalStartedDay: 0,
    weeklyGoalBaseline: {
      cash: 0,
      trust: 0,
      shadow: 0,
      completed: 0,
      comeback: 0,
    },
    ending: '',
    storyIntroSeen: false,
    log: ['DAY 1：博哥打开云售后办公室，客户已经在门口排队。'],
  };
}

export function normalizeState(raw: unknown): SaveState {
  const base = defaultState();
  const input =
    raw && typeof raw === 'object' ? (raw as Partial<SaveState>) : {};
  const next: SaveState = {
    ...base,
    ...input,
    version: 3,
    player: {
      office: { ...base.player.office, ...(input.player?.office || {}) },
      clientSite: {
        ...base.player.clientSite,
        ...(input.player?.clientSite || {}),
      },
    },
    stats: { ...base.stats, ...(input.stats || {}) },
    training: { ...base.training, ...(input.training || {}) },
    routes: { ...base.routes, ...(input.routes || {}) },
    completed: Array.isArray(input.completed) ? input.completed : [],
    failed: Array.isArray(input.failed) ? input.failed : [],
    issues: Array.isArray(input.issues)
      ? (input.issues.map(normalizeIssue).filter(Boolean) as Issue[])
      : [],
    locks: normalizeNumberRecord(input.locks),
    relationships: normalizeNumberRecord(input.relationships),
    storyFlags: Array.isArray(input.storyFlags)
      ? input.storyFlags.map(String).slice(0, 60)
      : [],
    achievements: Array.isArray(input.achievements)
      ? input.achievements.map(String).slice(0, 80)
      : [],
    perks: Array.isArray(input.perks)
      ? input.perks.map(String).filter(isPerkId)
      : [],
    claimedRewards: Array.isArray(input.claimedRewards)
      ? input.claimedRewards.map(String).slice(0, 80)
      : [],
    equippedSkills: Array.isArray(input.equippedSkills)
      ? input.equippedSkills.map(String).slice(0, 8)
      : [],
    weeklyGoalId:
      typeof input.weeklyGoalId === 'string' ? input.weeklyGoalId : '',
    contractStanceId:
      typeof input.contractStanceId === 'string'
        ? input.contractStanceId
        : 'standard',
    weeklyGoalStartedDay: Math.max(
      0,
      Math.floor(Number(input.weeklyGoalStartedDay) || 0),
    ),
    weeklyGoalBaseline: {
      cash: Math.max(
        0,
        Math.floor(Number(input.weeklyGoalBaseline?.cash) || 0),
      ),
      trust: Math.max(
        0,
        Math.floor(Number(input.weeklyGoalBaseline?.trust) || 0),
      ),
      shadow: Math.max(
        0,
        Math.floor(Number(input.weeklyGoalBaseline?.shadow) || 0),
      ),
      completed: Math.max(
        0,
        Math.floor(Number(input.weeklyGoalBaseline?.completed) || 0),
      ),
      comeback: Math.max(
        0,
        Math.floor(Number(input.weeklyGoalBaseline?.comeback) || 0),
      ),
    },
    log: Array.isArray(input.log) ? input.log.slice(0, 8) : base.log,
  };

  next.day = Math.max(1, Math.floor(Number(next.day) || 1));
  next.cycle = Math.max(1, Math.floor(Number(next.cycle) || 1));
  next.chapter = clamp(Math.floor(Number(next.chapter) || 1), 1, 3);
  next.level = Math.max(1, Math.floor(Number(next.level) || 1));
  next.xp = Math.max(0, Math.floor(Number(next.xp) || 0));
  next.actionPoints = clamp(Math.floor(Number(next.actionPoints) || 0), 0, 3);
  next.mapId = next.mapId === 'clientSite' ? 'clientSite' : 'office';
  next.ending = String(next.ending || '');
  next.weeklyGoalId = String(next.weeklyGoalId || '');
  next.contractStanceId = String(next.contractStanceId || 'standard');
  next.weeklyGoalStartedDay = Math.max(
    0,
    Math.floor(Number(next.weeklyGoalStartedDay) || 0),
  );
  next.storyIntroSeen = Boolean(next.storyIntroSeen);

  Object.keys(next.stats).forEach((key) => {
    const statKey = key as keyof SaveState['stats'];
    const max = statKey === 'cash' ? 99999 : 100;
    next.stats[statKey] = clamp(
      Math.floor(Number(next.stats[statKey]) || 0),
      0,
      max,
    );
  });
  Object.keys(next.training).forEach((key) => {
    next.training[key as TrainingKey] = clamp(
      Math.floor(Number(next.training[key as TrainingKey]) || 0),
      0,
      9,
    );
  });
  Object.keys(next.routes).forEach((key) => {
    const route = key as keyof SaveState['routes'];
    next.routes[route] = clamp(
      Math.floor(Number(next.routes[route]) || 0),
      0,
      100,
    );
  });
  (['office', 'clientSite'] as MapId[]).forEach((mapId) => {
    next.player[mapId].x = clamp(
      Math.floor(Number(next.player[mapId].x) || base.player[mapId].x),
      32,
      928,
    );
    next.player[mapId].y = clamp(
      Math.floor(Number(next.player[mapId].y) || base.player[mapId].y),
      84,
      928,
    );
  });

  return next;
}

export function loadState(): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function persistState(state: SaveState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function encodeSave(state: SaveState): string {
  return (
    SAVE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(state))))
  );
}

export function decodeSave(value: string): SaveState {
  if (!value.startsWith(SAVE_PREFIX)) throw new Error('bad-prefix');
  const json = decodeURIComponent(
    escape(atob(value.slice(SAVE_PREFIX.length))),
  );
  return normalizeState(JSON.parse(json));
}

export function addLog(state: SaveState, text: string): void {
  state.log.unshift(text);
  state.log = state.log.slice(0, 8);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function money(value: number): string {
  return `¥${Math.floor(value).toLocaleString('zh-CN')}`;
}

export function xpNeed(level: number): number {
  return 100 + level * 58;
}

export function trainCost(level: number, trainingLevel: number): number {
  return 130 + level * 28 + trainingLevel * 95;
}

export function levelUp(state: SaveState): string[] {
  const lines: string[] = [];
  while (state.xp >= xpNeed(state.level)) {
    state.xp -= xpNeed(state.level);
    state.level += 1;
    state.stats.cash += 70 + state.level * 18;
    state.stats.boundary = clamp(state.stats.boundary + 4, 0, 100);
    lines.push(`升级到 Lv.${state.level}：技能槽和售后腰杆都硬了一点。`);
    if (state.level >= 3 && !state.perks.includes('boss-prep')) {
      state.perks.push('boss-prep');
      lines.push('新特质：验收预案。Boss 前会把遗留问题逐条摊开。');
    }
  }
  return lines;
}

function normalizeNumberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, raw]) => [
      key,
      clamp(Math.floor(Number(raw) || 0), 0, 999),
    ]),
  );
}

function isPerkId(value: string): value is PerkId {
  return [
    'quote-ledger',
    'poc-playbook',
    'sla-shield',
    'review-cleanup',
    'shadow-clone',
    'boss-prep',
    'business-vow',
    'delivery-vow',
    'boundary-vow',
    'shadow-vow',
  ].includes(value);
}

function normalizeIssue(issue: unknown): Issue | null {
  if (!issue || typeof issue !== 'object') return null;
  const item = issue as Partial<Issue>;
  if (!item.label || !item.type || !item.sourceQuest) return null;
  return {
    id: String(item.id || `${item.sourceQuest}-${item.type}`),
    label: String(item.label),
    type: item.type,
    severity: clamp(Math.floor(Number(item.severity) || 1), 1, 30),
    sourceQuest: String(item.sourceQuest),
  };
}
