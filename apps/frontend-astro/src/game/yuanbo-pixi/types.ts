export type MapId = 'office' | 'site';
export type Direction = 'down' | 'left' | 'right' | 'up';
export type TrainingKey = 'pricing' | 'delivery' | 'sla' | 'review' | 'shadow';
export type RouteKey = 'business' | 'delivery' | 'boundary' | 'shadow';
export type Outcome = 'win' | 'partial' | 'fail';
export type SceneId = 'map' | 'battle';
export type IssueKind = 'budget' | 'delivery' | 'sla' | 'compliance' | 'pressure';

export interface Point {
  x: number;
  y: number;
}

export interface PlayerResources {
  cash: number;
  reputation: number;
  energy: number;
  patience: number;
  boundary: number;
  pressure: number;
}

export interface ClientState {
  anger: number;
  budget: number;
  scope: number;
  trust: number;
}

export interface Issue {
  id: string;
  kind: IssueKind;
  label: string;
  sourceQuest: string;
  severity: number;
}

export interface SaveState {
  version: 2;
  day: number;
  cycle: number;
  scene: SceneId;
  actionPoints: number;
  mapId: MapId;
  player: Record<MapId, Point>;
  resources: PlayerResources;
  xp: number;
  level: number;
  training: Record<TrainingKey, number>;
  routes: Record<RouteKey, number>;
  equippedSkills: string[];
  completed: string[];
  failed: string[];
  issues: Issue[];
  flags: string[];
  log: string[];
  ending: string;
  battle: BattleState | null;
}

export interface Hotspot {
  id: string;
  mapId: MapId;
  label: string;
  kind: 'board' | 'training' | 'rest' | 'portal' | 'save' | 'prep' | 'debt';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Npc {
  id: string;
  questId: string;
  mapId: MapId;
  name: string;
  role: string;
  x: number;
  y: number;
  color: number;
}

export interface Skill {
  id: string;
  name: string;
  category: RouteKey;
  training: TrainingKey;
  intent: string;
  cost: Partial<Pick<PlayerResources, 'energy' | 'patience' | 'boundary' | 'cash'>>;
  cooldown: number;
  effect: Partial<ClientState>;
  self?: Partial<PlayerResources>;
  unlock: (state: SaveState) => boolean;
}

export interface Quest {
  id: string;
  title: string;
  client: string;
  mapId: MapId;
  npcId: string;
  chapter: 1 | 2 | 3;
  route: RouteKey;
  cost: number;
  reward: number;
  xp: number;
  recommended: string[];
  risk: string;
  brief: string;
  objective: string;
  win: string;
  partial: string;
  fail: string;
  issue: Omit<Issue, 'id' | 'sourceQuest'>;
  initial: ClientState;
  unlock: (state: SaveState) => boolean;
  boss?: boolean;
  actIntro?: string;
  bossPhase?: string[];
}

export interface BattleState {
  questId: string;
  round: number;
  phase: number;
  maxPhase: number;
  client: ClientState;
  cooldowns: Record<string, number>;
  log: string[];
  outcome: Outcome | '';
  lastSkill: string;
  intent: string;
}

export interface BattleResult {
  state: SaveState;
  battle: BattleState;
  message: string;
}
