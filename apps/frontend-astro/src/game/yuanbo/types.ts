export type MapId = 'office' | 'clientSite';
export type RouteKey = 'business' | 'delivery' | 'boundary' | 'shadow';
export type TrainingKey =
  | 'pricing'
  | 'delivery'
  | 'sla'
  | 'recovery'
  | 'shadow';
export type Outcome = 'win' | 'partial' | 'fail';
export type Direction = 'down' | 'left' | 'right' | 'up';
export type ProgressionPhase =
  | 'tutorial'
  | 'early'
  | 'mid'
  | 'late'
  | 'boss'
  | 'postgame';
export type RiskProfile = 'budget' | 'trust' | 'scope' | 'anger' | 'mixed';
export type PerkId =
  | 'quote-ledger'
  | 'poc-playbook'
  | 'sla-shield'
  | 'review-cleanup'
  | 'shadow-clone'
  | 'boss-prep'
  | 'business-vow'
  | 'delivery-vow'
  | 'boundary-vow'
  | 'shadow-vow';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  route?: RouteKey;
}

export interface StoryCardDefinition {
  id: string;
  title: string;
  line: string;
  unlockHint: string;
  route?: RouteKey;
}

export interface CaseMemoryDefinition {
  id: string;
  questId: string;
  outcome: Outcome;
  title: string;
  line: string;
  unlockHint: string;
  route?: RouteKey;
}

export interface RouteMilestoneDefinition {
  id: string;
  route: RouteKey;
  threshold: number;
  title: string;
  line: string;
  rewardLine: string;
  effect: Partial<PlayerStats>;
}

export interface LegacyDefinition {
  id: string;
  route: RouteKey;
  title: string;
  line: string;
  effectLine: string;
  effect: Partial<PlayerStats>;
}

export interface ContractStanceDefinition {
  id: string;
  title: string;
  route: RouteKey;
  unlockHint: string;
  line: string;
  clientEffect: Partial<ClientStats>;
  selfEffect: Partial<PlayerStats>;
}

export interface WeeklyGoalDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  route: RouteKey;
  rewardLine: string;
}

export interface LongTermGoalDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  route: RouteKey;
  metric:
    | 'route'
    | 'completed'
    | 'codex'
    | 'relationships'
    | 'clean-boss'
    | 'legacies'
    | 'cash';
  rewardLine: string;
  storyLine: string;
}

export interface BossDocketCardDefinition {
  id: string;
  title: string;
  unlockHint: string;
  line: string;
  route: RouteKey;
  effect: Partial<ClientStats>;
  self?: Partial<PlayerStats>;
}

export interface CaseVariantDefinition {
  id: string;
  questId: string;
  title: string;
  condition: string;
  introLine: string;
  winLine: string;
  failLine: string;
  effect: Partial<ClientStats>;
  route: RouteKey;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlayerStats {
  cash: number;
  reputation: number;
  energy: number;
  patience: number;
  boundary: number;
  pressure: number;
}

export interface ClientStats {
  anger: number;
  budget: number;
  scope: number;
  trust: number;
}

export interface Issue {
  id: string;
  label: string;
  type: 'budget' | 'sla' | 'compliance' | 'delivery' | 'pressure';
  severity: number;
  sourceQuest: string;
}

export interface SaveState {
  version: 3;
  day: number;
  cycle: number;
  chapter: number;
  level: number;
  xp: number;
  actionPoints: number;
  mapId: MapId;
  player: Record<MapId, Point>;
  stats: PlayerStats;
  training: Record<TrainingKey, number>;
  routes: Record<RouteKey, number>;
  completed: string[];
  failed: string[];
  issues: Issue[];
  locks: Record<string, number>;
  relationships: Record<string, number>;
  storyFlags: string[];
  achievements: string[];
  perks: PerkId[];
  claimedRewards: string[];
  equippedSkills: string[];
  postgameLevel: number;
  tutorialConversions: number;
  phaseHintsSeen: string[];
  weeklyGoalId: string;
  contractStanceId: string;
  weeklyGoalStartedDay: number;
  weeklyGoalBaseline: {
    cash: number;
    trust: number;
    shadow: number;
    completed: number;
    comeback: number;
  };
  ending: string;
  storyIntroSeen: boolean;
  log: string[];
}

export interface MapHotspot {
  id: string;
  label: string;
  type: 'training' | 'board' | 'rest' | 'portal' | 'save' | 'field';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  mapId: MapId;
  x: number;
  y: number;
  tint: number;
  questId: string;
}

export interface QuestDefinition {
  id: string;
  title: string;
  client: string;
  mapId: MapId;
  npcId: string;
  route: RouteKey;
  recommendedLevel: number;
  cost: number;
  reward: number;
  xp: number;
  intro: string;
  winLine: string;
  partialLine: string;
  failLine: string;
  issue: Omit<Issue, 'id' | 'sourceQuest'>;
  enemy: ClientStats;
  chapter: number;
  arc: string;
  objective: string;
  traits: string[];
  preferred?: TrainingKey[];
  resistance?: Partial<Record<keyof ClientStats, number>>;
  phaseLines?: string[];
  tier?: ProgressionPhase;
  riskProfile?: RiskProfile;
  teachingHint?: string;
  recommendedPlan?: string[];
  unlock: (state: SaveState) => boolean;
  boss?: boolean;
  advanced?: boolean;
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: RouteKey;
  training?: TrainingKey;
  unlockLevel: number;
  cooldown: number;
  energy: number;
  patience: number;
  boundary?: number;
  line: string;
  effect: Partial<Record<keyof ClientStats, number>>;
  self?: Partial<Record<keyof PlayerStats, number>>;
}

export interface EventDefinition {
  id: string;
  title: string;
  line: string;
  effect: Partial<Record<keyof PlayerStats, number>>;
  choices?: Array<{
    label: string;
    line: string;
    effect: Partial<Record<keyof PlayerStats, number>>;
    training?: TrainingKey;
    clearIssue?: boolean;
  }>;
}

export interface FieldOperationDefinition {
  id: string;
  title: string;
  mapId: MapId;
  hotspotId: string;
  route: RouteKey;
  cost: number;
  unlockHint: string;
  line: string;
  successLine: string;
  effect: Partial<PlayerStats>;
  xp: number;
  routeGain: number;
  clearIssueType?: Issue['type'];
  issue?: Omit<Issue, 'id' | 'sourceQuest'>;
  relationshipQuestId?: string;
  relationshipGain?: number;
  unlock: (state: SaveState) => boolean;
}

export interface BattleState {
  questId: string;
  variantId?: string;
  stanceId?: string;
  round: number;
  phase: ProgressionPhase;
  intent: keyof ClientStats;
  danger: string;
  tutorialGuardUsed?: boolean;
  bossStage?: 1 | 2 | 3;
  client: ClientStats;
  cooldowns: Record<string, number>;
  flags: string[];
  log: string[];
}
