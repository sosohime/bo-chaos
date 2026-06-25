import type { Issue, MapId, SaveState, TrainingKey } from './types';

export const STORAGE_KEY = 'bo-chaos:yuanbo-pixi-alpha:v1';
export const SAVE_PREFIX = 'YBPIXI1:';

export function defaultState(): SaveState {
  return {
    version: 1,
    day: 1,
    cycle: 1,
    scene: 'map',
    actionPoints: 3,
    mapId: 'office',
    player: {
      office: { x: 248, y: 360 },
      site: { x: 130, y: 386 },
    },
    resources: {
      cash: 320,
      reputation: 36,
      energy: 92,
      patience: 88,
      boundary: 58,
      pressure: 18,
    },
    training: {
      pricing: 0,
      delivery: 0,
      sla: 0,
      review: 0,
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
    flags: [],
    log: ['DAY 1：客户已经在办公室门口，博哥先把免费售后改造成可收费服务。'],
    ending: '',
  };
}

export function normalizeState(input: unknown): SaveState {
  const base = defaultState();
  const raw = input && typeof input === 'object' ? (input as Partial<SaveState>) : {};
  const state: SaveState = {
    ...base,
    ...raw,
    version: 1,
    scene: raw.scene === 'battle' ? 'battle' : 'map',
    mapId: raw.mapId === 'site' ? 'site' : 'office',
    player: {
      office: { ...base.player.office, ...(raw.player?.office || {}) },
      site: { ...base.player.site, ...(raw.player?.site || {}) },
    },
    resources: { ...base.resources, ...(raw.resources || {}) },
    training: { ...base.training, ...(raw.training || {}) },
    routes: { ...base.routes, ...(raw.routes || {}) },
    completed: Array.isArray(raw.completed) ? raw.completed.map(String).slice(0, 20) : [],
    failed: Array.isArray(raw.failed) ? raw.failed.map(String).slice(0, 20) : [],
    issues: Array.isArray(raw.issues)
      ? (raw.issues.map(normalizeIssue).filter(Boolean) as Issue[])
      : [],
    flags: Array.isArray(raw.flags) ? raw.flags.map(String).slice(0, 50) : [],
    log: Array.isArray(raw.log) ? raw.log.map(String).slice(0, 8) : base.log,
    ending: String(raw.ending || ''),
  };

  state.day = clamp(Math.floor(Number(state.day) || 1), 1, 99);
  state.cycle = clamp(Math.floor(Number(state.cycle) || 1), 1, 99);
  state.actionPoints = clamp(Math.floor(Number(state.actionPoints) || 0), 0, 3);
  Object.keys(state.resources).forEach((key) => {
    const resource = key as keyof SaveState['resources'];
    state.resources[resource] = clamp(
      Math.floor(Number(state.resources[resource]) || 0),
      0,
      resource === 'cash' ? 99999 : 100,
    );
  });
  Object.keys(state.training).forEach((key) => {
    const training = key as TrainingKey;
    state.training[training] = clamp(Math.floor(Number(state.training[training]) || 0), 0, 5);
  });
  Object.keys(state.routes).forEach((key) => {
    const route = key as keyof SaveState['routes'];
    state.routes[route] = clamp(Math.floor(Number(state.routes[route]) || 0), 0, 100);
  });
  (['office', 'site'] as MapId[]).forEach((mapId) => {
    state.player[mapId].x = clamp(Math.floor(Number(state.player[mapId].x) || base.player[mapId].x), 40, 920);
    state.player[mapId].y = clamp(Math.floor(Number(state.player[mapId].y) || base.player[mapId].y), 100, 680);
  });
  return state;
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
  return SAVE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function decodeSave(code: string): SaveState {
  if (!code.startsWith(SAVE_PREFIX)) throw new Error('bad-prefix');
  const json = decodeURIComponent(escape(atob(code.slice(SAVE_PREFIX.length))));
  return normalizeState(JSON.parse(json));
}

export function addLog(state: SaveState, line: string): void {
  state.log.unshift(line);
  state.log = state.log.slice(0, 8);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function money(value: number): string {
  return `¥${Math.floor(value).toLocaleString('zh-CN')}`;
}

export function completedNormalCount(state: SaveState): number {
  return state.completed.filter((id) => id !== 'boss').length;
}

export function spendAction(state: SaveState, cost: number): boolean {
  if (state.resources.energy <= 0 || state.resources.patience <= 0) return false;
  const current = state.actionPoints;
  const next = current - cost;
  if (next < 0) return false;
  state.actionPoints = next;
  return true;
}

export function actionPoints(state: SaveState): number {
  return state.actionPoints;
}

export function setActionPoints(state: SaveState, value: number): void {
  state.actionPoints = clamp(Math.floor(value), 0, 3);
}

function normalizeIssue(raw: unknown): Issue | null {
  if (!raw || typeof raw !== 'object') return null;
  const issue = raw as Partial<Issue>;
  if (!issue.label || !issue.sourceQuest) return null;
  return {
    id: String(issue.id || `${issue.sourceQuest}-${issue.label}`),
    label: String(issue.label),
    sourceQuest: String(issue.sourceQuest),
    severity: clamp(Math.floor(Number(issue.severity) || 1), 1, 30),
  };
}
