import Phaser from 'phaser';

type Direction = 'down' | 'left' | 'right' | 'up';
type Beat =
  | 'wake'
  | 'finance'
  | 'financeAudit'
  | 'boss'
  | 'bossRehearsal'
  | 'customer'
  | 'customerReversal'
  | 'battle'
  | 'ending';
type Mode = 'map' | 'battle' | 'ending';
type Ending =
  | ''
  | 'paid'
  | 'bounded-comp'
  | 'clean-walkaway'
  | 'poc-limbo'
  | 'free-burnout';
type SkillId = 'quote' | 'compensate' | 'boundary' | 'walkaway' | 'breathe';
type SpeakerId = 'bo' | 'finance' | 'boss' | 'customer' | 'system';
type PrepId = 'pricing-rehearsal' | 'poc-demo' | 'walkaway-script';
type ClientIntentType = 'price' | 'scope' | 'anger';
type MilestoneId = 'open' | 'act1' | 'act2' | 'act3' | 'final' | 'ending';
type ZoneId = 'desk' | 'finance' | 'boss' | 'customer' | 'briefing';
type DebtId =
  | 'pricing-limbo'
  | 'budget-blame'
  | 'free-cap'
  | 'full-launch'
  | 'overpromise'
  | 'compensation-habit'
  | 'relationship-cold';

interface Metrics {
  cash: number;
  trust: number;
  patience: number;
  boundary: number;
  pressure: number;
}

interface BattleClient {
  anger: number;
  budget: number;
  scope: number;
  trust: number;
}

interface BattleState {
  round: number;
  phase: number;
  client: BattleClient;
  log: string[];
  used: Record<string, number>;
  intent: string;
  intentType: ClientIntentType;
  storyPressure?: StoryPressure;
  lastSkill?: SkillId;
  lastFeedback?: string;
  lastImpact?: BattleImpact;
}

interface PrologueState {
  version: 1;
  beat: Beat;
  mode: Mode;
  player: { x: number; y: number };
  direction: Direction;
  metrics: Metrics;
  clues: string[];
  decisions: string[];
  debts: DebtId[];
  preps: PrepId[];
  timeLeft: number;
  timeLog: string[];
  milestones: MilestoneId[];
  ending: Ending;
  battle?: BattleState;
  log: string[];
}

interface Shared {
  boWalk: string;
  boPortraits: string;
  expertBo: string;
  getState: () => PrologueState;
  setState: (state: PrologueState) => void;
  save: () => void;
}

interface ActorDefinition {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  beat: Beat;
  tint: number;
}

interface HotspotDefinition {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'desk' | 'clue' | 'menu' | 'prep';
  clue?: string;
}

interface EvidenceOption {
  id: string;
  label: string;
  detail: string;
  line: string;
  effect: Partial<Metrics>;
}

interface LedgerSortItem {
  id: 'gpu' | 'trial' | 'free';
  label: string;
  source: string;
  target: string;
  line: string;
  color: number;
}

interface LedgerSortSlot {
  id: LedgerSortItem['id'];
  target: string;
  label: string;
  placed: boolean;
}

interface CustomerJokeFragment {
  id: 'price' | 'compensation' | 'walkaway';
  quote: string;
  pressure: string;
  lane: string;
  color: number;
}

interface CustomerJokeRoute {
  decision: 'customer:quote' | 'customer:compensate' | 'customer:walkaway';
  label: string;
  route: ActionForecast['route'];
  boLine: string;
  gain: string;
  risk: string;
  endgame: string;
  color: number;
}

interface CustomerReversalPressure {
  id: 'free' | 'scope' | 'walkaway';
  label: string;
  quote: string;
  pressure: string;
  lane: string;
  color: number;
}

interface CustomerReversalRoute {
  decision:
    | 'customerReversal:quote-table'
    | 'customerReversal:poc-only'
    | 'customerReversal:walkaway-line';
  opening: 'customer:quote' | 'customer:compensate' | 'customer:walkaway';
  label: string;
  route: ActionForecast['route'];
  boLine: string;
  gain: string;
  risk: string;
  endgame: string;
  color: number;
}

interface BossLaunchPressure {
  id: 'time' | 'promise' | 'face';
  label: string;
  quote: string;
  pressure: string;
  lane: string;
  color: number;
}

interface BossLaunchRoute {
  decision: 'boss:scope' | 'boss:poc' | 'boss:hard';
  label: string;
  route: ActionForecast['route'];
  boLine: string;
  gain: string;
  risk: string;
  endgame: string;
  color: number;
}

interface PrepOption {
  id: PrepId;
  label: string;
  detail: string;
  line: string;
  effect: Partial<Metrics>;
  clears?: DebtId[];
}

interface PrepWorkbenchCard {
  id: PrepId;
  label: string;
  route: ActionForecast['route'];
  line: string;
  gain: string;
  risk: string;
  prepared: boolean;
}

interface SkillDefinition {
  id: SkillId;
  label: string;
  detail: string;
  color: number;
  counters: ClientIntentType[];
}

interface SkillPreview {
  effect: string;
  reason: string;
  countered: boolean;
}

interface BattleCommand {
  id: SkillId;
  label: string;
  speech: string;
  counter: string;
  risk: string;
  effect: string;
  countered: boolean;
}

interface BattleTableProp {
  label: string;
  line: string;
  color: number;
}

interface StoryPressure {
  source: string;
  line: string;
  replyHint: string;
  counters: SkillId[];
}

interface MilestoneDefinition {
  label: string;
  line: string;
}

interface SceneCue {
  title: string;
  line: string;
  thought: string;
  focus: { x: number; y: number; w: number; h: number };
  prop: 'messages' | 'bill' | 'audit' | 'launch' | 'rehearsal' | 'customer' | 'reversal';
}

interface StorySetPiece {
  title: string;
  subtitle: string;
  props: string[];
  tone: 'money' | 'launch' | 'customer' | 'briefing';
}

interface StageComposition {
  title: string;
  antagonist: string;
  conflict: string;
  evidence: string;
  playerTask: string;
  residue: string[];
  next: string;
  tone: StorySetPiece['tone'];
}

interface SceneMemoryProp {
  label: string;
  line: string;
  color: number;
}

interface MapStageSnapshot {
  mode: 'opening-pressure-stage' | 'focused-act-stage';
  activeZone: ZoneId;
  visibleZones: ZoneId[];
  sceneTitle: string;
}

interface SceneEventBubble {
  from: string;
  line: string;
  tone: 'urgent' | 'money' | 'launch' | 'customer' | 'bo';
}

interface OpeningInboxItem {
  id: 'finance' | 'boss' | 'customer';
  from: string;
  title: string;
  line: string;
  color: number;
}

interface OpeningMessageTarget extends OpeningInboxItem {
  x: number;
  y: number;
  w: number;
  h: number;
  decision: 'opening:finance' | 'opening:boss' | 'opening:customer';
}

interface OpeningInboxChoice {
  id: OpeningInboxItem['id'];
  decision: OpeningMessageTarget['decision'];
  label: string;
  route: ActionForecast['route'];
  boLine: string;
  gain: string;
  risk: string;
  endgame: string;
  color: number;
}

interface OpeningStageLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  desk: { x: number; y: number; w: number; h: number };
  callout: { x: number; y: number };
}

interface BeatBridge {
  nextBeat: Beat;
  title: string;
  kicker: string;
  sceneLine: string;
  boLine: string;
  nextAction: string;
  speaker: SpeakerId;
  accent: number;
}

interface BridgeStoryboardPanel {
  label: string;
  line: string;
  color: number;
}

interface StoryBeatCard {
  clock: string;
  place: string;
  act: string;
  current: string;
  goal: string;
  win: string;
  fail: string;
  endgame: string;
  stakes: string;
  next: string;
  target: string;
}

interface StageZone {
  id: ZoneId;
  title: string;
  subtitle: string;
  act: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: number;
}

interface DebtDefinition {
  label: string;
  line: string;
  battle: Partial<BattleClient>;
}

interface OutcomeSnapshot {
  metrics: Metrics;
  debts: DebtId[];
}

interface RouteReport {
  title: string;
  grade: string;
  scores: string[];
  advice: string;
}

interface EndingEcho {
  speaker: SpeakerId;
  line: string;
}

interface BattleImpact {
  skill: SkillId;
  title: string;
  customerLine: string;
  deltas: string[];
  countered: boolean;
  phaseBreak: boolean;
  nextIntent: ClientIntentType;
  fx: SkillId;
}

interface BattleTurnBeat {
  customer: string;
  bo: string;
  result: string;
  tone: 'waiting' | 'countered' | 'risk' | 'phase';
}

interface BattleDuelFocus {
  title: string;
  customerLine: string;
  boHint: string;
  tableLine: string;
  recommended: string[];
}

interface BattleClosingGoal {
  label: string;
  status: string;
  line: string;
  progress: number;
  color: number;
  done: boolean;
}

interface NegotiationTableLines {
  customer: string;
  bo: string;
  table: string;
}

interface BattleImpactContext {
  skill: SkillId;
  beforeClient: BattleClient;
  beforeMetrics: Metrics;
  beforeIntent: ClientIntentType;
  countered: boolean;
}

interface InteractionTarget {
  id: string;
  label: string;
  distance: number;
  actor?: ActorDefinition;
  hotspot?: HotspotDefinition;
}

interface GuideTarget {
  id: string;
  label: string;
  action: string;
  x: number;
  y: number;
}

interface DialogChoice {
  label: string;
  detail?: string;
  forecast?: ActionForecast;
  action: () => void;
}

interface ActionForecast {
  route: '报价' | '补偿' | '边界' | '拉倒' | '稳住' | '冒险';
  gain: string;
  risk: string;
  endgame?: string;
}

interface ManagementHint {
  ledger: string;
  gap: string;
  recommendation: string;
  finalUse: string;
}

interface DecisionVignette {
  speaker: SpeakerId;
  title: string;
  boLine: string;
  replyLine: string;
}

interface ChoiceOutcomeCard {
  title: string;
  decision: string;
  sceneChange: string;
  finalImpact: string;
  nextAction: string;
  chips: string[];
}

interface PhaseBreakCard {
  completedTitle: string;
  story: string;
  nextTitle: string;
  nextGoal: string;
  nextPressure: string;
  panels: PhaseBreakPanel[];
  chips: string[];
}

interface PhaseBreakPanel {
  label: string;
  line: string;
  color: number;
}

interface SpeakerProfile {
  id: SpeakerId;
  name: string;
  role: string;
  tone: string;
  color: number;
  texture: string;
}

interface PrologueQa {
  snapshot: () => unknown;
  reset: () => void;
  moveTo: (id: string) => void;
  interact: () => void;
  interactWith: (id: string) => void;
  choose: (index?: number) => void;
  useSkill: (id: SkillId) => void;
  exportCode: () => string;
  importCode: (code: string) => boolean;
}

declare global {
  interface Window {
    __YUANBO_PROLOGUE_QA__?: PrologueQa;
  }
}

const GAME_W = 960;
const GAME_H = 540;
const WORLD_H = 650;
const STORAGE_KEY = 'bo-chaos:yuanbo-first-day-prologue:v1';
const SAVE_PREFIX = 'YBPROLOGUE1:';
const STARTING_TIME = 6;
const BO_FRAME_W = 128;
const BO_FRAME_H = 160;
const BO_PORTRAIT_W = 128;
const BO_PORTRAIT_H = 160;
const SPEED = 205;
const IDLE_FRAME: Record<Direction, number> = {
  down: 1,
  left: 4,
  right: 7,
  up: 10,
};
const SPEAKERS: Record<SpeakerId, SpeakerProfile> = {
  bo: {
    id: 'bo',
    name: '博哥',
    role: '云产品经理 / 极限售后主角',
    tone: '清醒但快被群消息淹没',
    color: 0x2d83a5,
    texture: 'speaker-bo',
  },
  finance: {
    id: 'finance',
    name: '财务姐',
    role: '成本守门人',
    tone: '截图在手，账不许糊',
    color: 0xc98035,
    texture: 'speaker-finance',
  },
  boss: {
    id: 'boss',
    name: '老板',
    role: '上线压力源',
    tone: '今天必须有个体面说法',
    color: 0x3d6fa5,
    texture: 'speaker-boss',
  },
  customer: {
    id: 'customer',
    name: '客户姐',
    role: '免费售后边界测试器',
    tone: '再梳一次，可以；收钱，先解释',
    color: 0x2d8f73,
    texture: 'speaker-customer',
  },
  system: {
    id: 'system',
    name: '今日资料',
    role: '第一天复盘',
    tone: '把笑话落成收费、补偿、拉倒',
    color: 0x6b5d35,
    texture: 'speaker-system',
  },
};
const DEBTS: Record<DebtId, DebtDefinition> = {
  'pricing-limbo': {
    label: '价格没说清',
    line: '前面先稳情绪但没落价格，客户会默认还能继续聊免费。',
    battle: { budget: -8, scope: 5 },
  },
  'budget-blame': {
    label: '预算追问',
    line: '账单归属没有钉死，客户会拿“谁批的钱”继续压价。',
    battle: { budget: -12, anger: 6 },
  },
  'free-cap': {
    label: '免费额度问题',
    line: '给了台阶，也留下“再多一点也可以吧”的口子。',
    battle: { scope: 8, trust: 4 },
  },
  'full-launch': {
    label: '全部上线承诺',
    line: '今天上线被说得太满，客户会把小范围试点当成全部上线交付。',
    battle: { scope: 14, anger: 5 },
  },
  overpromise: {
    label: '话说太满',
    line: '彩排时话说满了，谈判时每一句都会被客户翻出来。',
    battle: { anger: 8, trust: -5 },
  },
  'compensation-habit': {
    label: '补偿越补越多',
    line: '先答应补一次，客户会顺势要求“那就顺手全部上线”。',
    battle: { scope: 10, budget: -5 },
  },
  'relationship-cold': {
    label: '关系变冷',
    line: '拉倒说早了，边界更稳，但客户一开始会更顶。',
    battle: { anger: 10, trust: -7, scope: -5 },
  },
};
const BEAT_ORDER: Beat[] = [
  'wake',
  'finance',
  'financeAudit',
  'boss',
  'bossRehearsal',
  'customer',
  'customerReversal',
  'battle',
  'ending',
];
const BEAT_LABEL: Record<Beat, string> = {
  wake: '09:17 工位醒来',
  finance: '10:05 财务姐拍账单',
  financeAudit: '10:42 谁来背账',
  boss: '11:30 老板催上线',
  bossRehearsal: '12:18 上线彩排',
  customer: '14:20 客户姐到场',
  customerReversal: '15:05 免费反悔',
  battle: '16:00 收费谈判',
  ending: '19:40 关灯复盘',
};
const OBJECTIVE: Record<Beat, string> = {
  wake: '去博哥工位读今天第一条事故，先知道这钱到底从哪炸的。',
  finance: '找财务姐拆 GPU 账单，把“云很贵”讲成能收费的表。',
  financeAudit: '财务姐追问谁批的预算：要么立收费说法，要么留下免费售后留下的问题。',
  boss: '去老板玻璃房，争取上线说法和验收边界。',
  bossRehearsal: '在作战桌做上线彩排：选能承诺的交付，不要把全部上线吹成今天。',
  customer: '到客户接待区面对客户姐：免费再来一次，还是先说钱。',
  customerReversal: '客户姐临场反悔：她要免费全部上线，也要一句“不行拉倒”的体面话。',
  battle: '用“报价、补一次、签范围、拉倒”打完三段售后谈判。',
  ending: '看今天的结局复盘：钱、边界、关系，哪个保住了。',
};
const MILESTONES: Record<MilestoneId, MilestoneDefinition> = {
  open: {
    label: '开场：三群同时炸',
    line: '玩家知道今天不是普通工单，而是收费、上线、免费售后的连环事故。',
  },
  act1: {
    label: '第一幕：这钱从哪收',
    line: 'GPU 账单被拆成可收费的资料，免费售后开始有价格。',
  },
  act2: {
    label: '第二幕：今天上线怎么说',
    line: '老板的上线压力被拆成小范围试点、验收说法和失败退路。',
  },
  act3: {
    label: '第三幕：免费再来一次',
    line: '客户笑话上桌，补偿、报价和拉倒正式变成选择。',
  },
  final: {
    label: '终幕：报价/补偿/拉倒谈判',
    line: '前半天的资料、准备和遗留问题全部进入回合制谈判。',
  },
  ending: {
    label: '复盘：第一天收工',
    line: '结局给出路线称号、经营结果和下一轮改进方向。',
  },
};
const BEAT_MILESTONE: Partial<Record<Beat, MilestoneId>> = {
  wake: 'open',
  finance: 'act1',
  boss: 'act2',
  customer: 'act3',
  battle: 'final',
  ending: 'ending',
};
const STORY_BEATS: Record<Beat, StoryBeatCard> = {
  wake: {
    clock: '09:17',
    place: '博哥工位',
    act: '开场 / 事故同时进门',
    current: '三条消息一起炸：财务问钱、老板问上线、客户问免费再来一次。',
    goal: '先决定第一句话回谁，不要默认答应免费跟进。',
    win: '第一句话立住方向，今天不从“可以”开始输。',
    fail: '先乱答应，下午会带着价格没说清上桌。',
    endgame: '开局路线会影响终幕预算、信任或边界起点。',
    stakes: '如果博哥先回“可以”，今天晚上就会变成免费跟进。',
    next: '去工位读事故源头，再决定先查哪张证据。',
    target: 'desk',
  },
  finance: {
    clock: '09:32',
    place: '财务账单桌',
    act: '第一幕 / 钱从哪里收',
    current: '财务姐把 GPU 账单拍出来，问题不是贵，是谁来认。',
    goal: '让收费有依据，把云资源拆成客户听得懂的服务。',
    win: '拿到成本资料，报价不再像临时加钱。',
    fail: '价格讲不清，终幕客户会继续问为什么不是免费。',
    endgame: '影响终幕预算起点和砍价压力。',
    stakes: '收不成钱，下午所有补偿都会从博哥耐心里扣。',
    next: '把账单拆成基础包、加急包、试用额度。',
    target: 'finance',
  },
  financeAudit: {
    clock: '10:42',
    place: '财务账单桌',
    act: '第一幕 / 免费额度不是无底洞',
    current: '财务姐追问预算归属，试用继续白送还是转收费试点。',
    goal: '回答谁认预算，别把账单拖到晚上。',
    win: '收费试点或免费上限写清楚，预算问题被压住。',
    fail: '自己先扛会留下预算追问，终幕更难收钱。',
    endgame: '决定终幕是否带着预算追问开局。',
    stakes: '这里糊过去，会把“预算追问”带进最终谈判。',
    next: '立收费说法，或者给一次有上限的台阶。',
    target: 'finance',
  },
  boss: {
    clock: '11:30',
    place: '老板玻璃房',
    act: '第二幕 / 今天上线四个字最贵',
    current: '老板要今天上线，博哥要把上线拆成可验收的小范围试点。',
    goal: '把今天上线缩成能验收的小范围试点。',
    win: '老板有体面说法，博哥有交付边界。',
    fail: '硬接全部上线，终幕客户会把范围往外推。',
    endgame: '影响终幕需求压力和客户追责。',
    stakes: '承诺说满，晚上客户会把小范围试点当全部上线交付。',
    next: '去玻璃房谈验收说法，把“今天上线”改成可交付的试点。',
    target: 'boss',
  },
  bossRehearsal: {
    clock: '12:18',
    place: '上线彩排桌',
    act: '第二幕 / 漂亮话要能活到晚上',
    current: '上线彩排开始，老板要体面，合同要边界。',
    goal: '排出客户听得懂、晚上也能站住的上线台词。',
    win: '试点、验收、失败退路都能说清。',
    fail: '话说太满，终幕需求和怒气一起涨。',
    endgame: '决定终幕需求会不会快速失控。',
    stakes: '说法越漂亮，没写进验收就越像反过来追责。',
    next: '排一版客户听得懂、博哥兜得住的台词。',
    target: 'boss',
  },
  customer: {
    clock: '14:20',
    place: '客户接待区',
    act: '第三幕 / 笑话上桌',
    current: '客户姐把“再给你梳一次，不行拉倒吧”扔上桌。',
    goal: '判断先报价、补一次，还是先把拉倒讲清。',
    win: '选定终幕开局路线，别被笑话带走节奏。',
    fail: '只顾稳关系，补一次会被说成顺手全部上线。',
    endgame: '决定终幕预算、信任或边界哪项先占优。',
    stakes: '这不是一句脏话，是免费售后、补偿和边界的压力测试。',
    next: '选择先报价、补一次，还是先把拉倒讲清楚。',
    target: 'customer',
  },
  customerReversal: {
    clock: '15:05',
    place: '客户接待区',
    act: '第三幕 / 顺手两个字最危险',
    current: '客户把“再梳一次”改口成“顺手全部上线”。',
    goal: '把“顺手”拆成报价表、试点范围或退场规则。',
    win: '终幕开局有路线，不再从免费幻想开始谈。',
    fail: '顺手不拆开，终幕需求会越谈越大。',
    endgame: '直接决定终幕三段谈判的起手难度。',
    stakes: '如果不拆范围，今天会从补一次变成补全世界。',
    next: '拿报价表、小范围试点范围或退场机制进入收费谈判。',
    target: 'customer',
  },
  battle: {
    clock: '16:00',
    place: '收费谈判桌',
    act: '终幕 / 收钱、补偿、拉倒',
    current: '所有证据、遗留问题、承诺都进入三段谈判。',
    goal: '九回合内至少保住钱、关系、边界里的两个。',
    win: '客户接受收费、小范围试点或体面退场。',
    fail: '耐心归零、预算归零、怒气爆满或需求失控。',
    endgame: '决定今天路线称号和下一轮复盘方向。',
    stakes: '钱、关系、边界不能全靠嘴硬，技能顺序会决定结局。',
    next: '打穿三段谈判：先收费，再补小范围试点，最后体面拉倒。',
    target: 'battle',
  },
  ending: {
    clock: '19:40',
    place: '会议室收工',
    act: '复盘 / 今天值不值',
    current: '第一天收工，路线称号会说明你到底保住了什么。',
    goal: '看清今天赢在哪里，下一轮要补哪块短板。',
    win: '路线称号、评分和复盘建议都能指向下一次打法。',
    fail: '只看输赢不看原因，下轮还会被免费售后拖住。',
    endgame: '复盘决定下一次走报价、补偿还是边界路线。',
    stakes: '钱收上来不等于赢，遗留问题没清也会留下明天。',
    next: '看结局，决定下次走报价、补偿还是边界路线。',
    target: 'ending',
  },
};
const SCENE_CUES: Partial<Record<Beat, SceneCue>> = {
  wake: {
    title: '三群同时炸',
    line: '财务截图、老板催办、客户语音一起砸到工位上。',
    thought: '先别回“可以”，先查证据。',
    focus: { x: 76, y: 332, w: 198, h: 92 },
    prop: 'messages',
  },
  finance: {
    title: '账单拍桌',
    line: 'GPU 峰值曲线被财务姐推到面前：这钱到底谁收？',
    thought: '把云资源翻译成能收费的项目。',
    focus: { x: 292, y: 312, w: 188, h: 94 },
    prop: 'bill',
  },
  financeAudit: {
    title: '谁来背账',
    line: '财务姐不问技术，问预算归属：试用还能不能继续白送？',
    thought: '免费可以有额度，不能没有尽头。',
    focus: { x: 292, y: 312, w: 188, h: 94 },
    prop: 'audit',
  },
  boss: {
    title: '今天上线',
    line: '老板要一句能播出去的话，博哥要一句能活到晚上的边界。',
    thought: '承诺越漂亮，晚上越可能追责。',
    focus: { x: 520, y: 174, w: 202, h: 112 },
    prop: 'launch',
  },
  bossRehearsal: {
    title: '上线彩排',
    line: '小范围试点、全部上线、验收说法摊在作战桌上，话不能说满。',
    thought: '今天能交付的是试点，不是幻想。',
    focus: { x: 520, y: 174, w: 202, h: 112 },
    prop: 'rehearsal',
  },
  customer: {
    title: '免费再梳一次',
    line: '客户姐坐下就把笑话抛出来：收钱、补一次、拉倒。',
    thought: '笑点背后是边界测试。',
    focus: { x: 706, y: 326, w: 190, h: 98 },
    prop: 'customer',
  },
  customerReversal: {
    title: '顺手全部上线',
    line: '“既然再梳一次，今天顺手全部上线吧。”遗留问题开始膨胀。',
    thought: '顺手两个字，最贵。',
    focus: { x: 706, y: 326, w: 190, h: 98 },
    prop: 'reversal',
  },
};
const SCENE_EVENTS: Partial<Record<Beat, SceneEventBubble[]>> = {
  wake: [
    { from: '财务群', line: 'GPU 试用账单谁认？', tone: 'money' },
    { from: '老板', line: '下午客户来，今天要上线。', tone: 'launch' },
    { from: '客户语音', line: '再给我梳一次呗。', tone: 'customer' },
  ],
  finance: [
    { from: '财务姐', line: '我不问技术，我问钱怎么收。', tone: 'money' },
    { from: '账单截图', line: '昨晚峰值已经爆到天花板。', tone: 'urgent' },
    { from: '博哥心里', line: '先拆基础包和加急包。', tone: 'bo' },
  ],
  financeAudit: [
    { from: '财务姐', line: '试用继续白送，后面谁签字？', tone: 'money' },
    { from: '预算栏', line: '空着，就会晚上回来找你。', tone: 'urgent' },
    { from: '博哥心里', line: '给台阶，也要有上限。', tone: 'bo' },
  ],
  boss: [
    { from: '老板', line: '客户来了，我要一句体面话。', tone: 'launch' },
    { from: '大屏', line: '今天上线，不等于全部交付。', tone: 'urgent' },
    { from: '博哥心里', line: '先把验收边界写下来。', tone: 'bo' },
  ],
  bossRehearsal: [
    { from: '老板', line: '这话客户听了能不能点头？', tone: 'launch' },
    { from: '白板', line: '试点范围、验收、失败退路。', tone: 'urgent' },
    { from: '博哥心里', line: '漂亮话要能活到晚上。', tone: 'bo' },
  ],
  customer: [
    { from: '客户姐', line: '再梳一次，不行拉倒吧。', tone: 'customer' },
    { from: '会议桌', line: '所有人都等博哥先开口。', tone: 'urgent' },
    { from: '博哥心里', line: '笑话背后是收费边界。', tone: 'bo' },
  ],
  customerReversal: [
    { from: '客户姐', line: '顺手全部上线，也不多吧？', tone: 'customer' },
    { from: '范围单', line: '能做、不能做、加钱做。', tone: 'money' },
    { from: '博哥心里', line: '补一次可以，补全世界不行。', tone: 'bo' },
  ],
  battle: [
    { from: '谈判桌', line: '报价、补偿、拉倒都要讲清。', tone: 'urgent' },
    { from: '客户姐', line: '你先别套餐，我就问为啥收钱。', tone: 'customer' },
    { from: '博哥心里', line: '至少保住钱、关系、边界里的两个。', tone: 'bo' },
  ],
  ending: [
    { from: '会议室', line: '灯暗了，账单还在桌上。', tone: 'urgent' },
    { from: '路线复盘', line: '今天保住了什么，会写进称号。', tone: 'bo' },
  ],
};
const OPENING_INBOX: OpeningInboxItem[] = [
  {
    id: 'finance',
    from: '财务群',
    title: 'GPU 账单',
    line: '试用超了，谁认钱？',
    color: 0xc98035,
  },
  {
    id: 'boss',
    from: '老板 @我',
    title: '今天上线',
    line: '下午客户来，要体面。',
    color: 0x3d6fa5,
  },
  {
    id: 'customer',
    from: '客户语音',
    title: '再梳一次',
    line: '不行就拉倒吧。',
    color: 0x2d8f73,
  },
];
const OPENING_INBOX_CHOICES: OpeningInboxChoice[] = [
  {
    id: 'finance',
    decision: 'opening:finance',
    label: '先回财务：钱不能糊',
    route: '报价',
    boLine: 'GPU 账单我先拆，免费和正式服务分开算。',
    gain: '先把收钱入口立住。',
    risk: '客户会觉得你变现实，关系先冷一点。',
    endgame: '终幕报价更顺，客户情绪会高一点。',
    color: 0xc98035,
  },
  {
    id: 'boss',
    decision: 'opening:boss',
    label: '先回老板：上线别吹满',
    route: '边界',
    boLine: '今天能上线试点，但不能把全部上线先吹出去。',
    gain: '老板先知道今天只能交付试点。',
    risk: '财务还在等账单归属，钱的问题会更烫。',
    endgame: '终幕范围更稳，但预算要补回来。',
    color: 0x3d6fa5,
  },
  {
    id: 'customer',
    decision: 'opening:customer',
    label: '先回客户：我先听你说',
    route: '稳住',
    boLine: '我先听你把问题说完，能梳，但要把范围讲清。',
    gain: '客户愿意继续聊，关系先稳住。',
    risk: '价格没先落桌，免费预期会带到后面。',
    endgame: '终幕信任更高，但收费要更费口舌。',
    color: 0x2d8f73,
  },
];
const BEAT_BRIDGES: Partial<Record<Beat, BeatBridge>> = {
  finance: {
    nextBeat: 'finance',
    title: '第一幕开场：财务姐拍账单',
    kicker: '09:32 / 从工位走到财务桌',
    sceneLine: '账单截图被投到桌面，GPU 峰值像一条红线贴着天花板走。',
    boLine: '先把钱从“云很贵”翻译成“谁该付、付多少”。',
    nextAction: '走到财务姐面前，拆 GPU 账单。',
    speaker: 'finance',
    accent: 0xc98035,
  },
  financeAudit: {
    nextBeat: 'financeAudit',
    title: '第一幕升级：不是贵，是谁认',
    kicker: '10:42 / 截图被再次放大',
    sceneLine: '财务姐没有离场，她把预算栏圈出来，等博哥给一个能入账的说法。',
    boLine: '免费可以有台阶，但不能没有上限。',
    nextAction: '回答预算追问，决定收费试点还是补一次。',
    speaker: 'finance',
    accent: 0xc98035,
  },
  boss: {
    nextBeat: 'boss',
    title: '第二幕开场：老板要今天上线',
    kicker: '11:30 / 玻璃房门开了',
    sceneLine: '老板只要一句能对外讲的话，博哥知道那句话晚上会被客户逐字验收。',
    boLine: '今天能上线的是小范围试点，不是把未来全签出去。',
    nextAction: '去老板玻璃房，把上线说法讲清楚。',
    speaker: 'boss',
    accent: 0x3d6fa5,
  },
  bossRehearsal: {
    nextBeat: 'bossRehearsal',
    title: '第二幕升级：漂亮话要能落地',
    kicker: '12:18 / 大屏打开彩排',
    sceneLine: '试点范围、验收句、失败退路摊在桌上，老板要体面，博哥要活路。',
    boLine: '能承诺的写清楚，不能承诺的别靠笑场混过去。',
    nextAction: '排一版客户听得懂的上线台词。',
    speaker: 'boss',
    accent: 0x3d6fa5,
  },
  customer: {
    nextBeat: 'customer',
    title: '第三幕开场：笑话上桌',
    kicker: '14:20 / 客户接待区',
    sceneLine: '客户姐坐下就抛出那句笑话，会议室安静了一秒，然后所有人看向博哥。',
    boLine: '她问的不是梳不梳，是免费售后能不能一直白送。',
    nextAction: '面对客户姐，先决定报价、补一次还是拉倒。',
    speaker: 'customer',
    accent: 0x2d8f73,
  },
  customerReversal: {
    nextBeat: 'customerReversal',
    title: '第三幕反转：顺手全部上线',
    kicker: '15:05 / 笑话变成要求',
    sceneLine: '“既然再梳一次，那今天顺手全部上线吧。”一句顺手，把半天准备推到桌边。',
    boLine: '补一次可以，补全世界不行。',
    nextAction: '把报价表、试点范围或退场机制拿上桌。',
    speaker: 'customer',
    accent: 0x2d8f73,
  },
  battle: {
    nextBeat: 'battle',
    title: '终幕开场：收费谈判',
    kicker: '16:00 / 所有证据上桌',
    sceneLine: '财务的账、老板的话、客户的补一次，全部汇成一场收费谈判。',
    boLine: '钱、关系、边界，今天至少要保住两个。',
    nextAction: '进入三段谈判：收费、补小范围试点、体面拉倒。',
    speaker: 'customer',
    accent: 0xffdf86,
  },
  ending: {
    nextBeat: 'ending',
    title: '收工镜头：第一天关灯',
    kicker: '19:40 / 会议室灯暗下去',
    sceneLine: '客户离场，账单还在，白板还在，博哥终于能看今天到底保住了什么。',
    boLine: '收钱不一定赢，免费也不一定输，关键是明天还有没有边界。',
    nextAction: '查看今天的路线称号和复盘。',
    speaker: 'bo',
    accent: 0x2d83a5,
  },
};
const PHASES = [
  {
    title: '一、这姐咋收钱啊',
    goal: '先让客户承认这不是随手白送，再把预算说到桌面上。',
    pass: (battle: BattleState) =>
      battle.client.budget >= 55 && battle.client.trust >= 45,
    line: '报价说法立住了：免费不是没有，免费得先有边界。',
  },
  {
    title: '二、再给你梳一次',
    goal: '把“再梳一次”压成小范围试点，别让今天变成全部上线。',
    pass: (battle: BattleState) =>
      battle.client.trust >= 62 && battle.client.scope <= 70,
    line: '补一次变成小范围试点，客户终于知道这不是无限续杯。',
  },
  {
    title: '三、不行拉倒吧',
    goal: '把能做、不能做、加钱做讲清楚，拉倒也要体面收桌。',
    pass: (battle: BattleState, state: PrologueState) =>
      battle.client.anger <= 85 &&
      battle.client.scope <= 65 &&
      (battle.client.budget >= 50 || state.metrics.boundary >= 72),
    line: '拉倒不是摔门，是把能做、不能做、加钱做写到同一张纸上。',
  },
];
const BATTLE_SKILLS: SkillDefinition[] = [
  {
    id: 'quote',
    label: '报价上桌',
    detail: '先说清基础包和加急包',
    color: 0x8f6828,
    counters: ['price'],
  },
  {
    id: 'compensate',
    label: '补一次',
    detail: '免费梳成小范围试点，不许全部上线',
    color: 0x2d7163,
    counters: ['anger'],
  },
  {
    id: 'boundary',
    label: '签范围',
    detail: '能做、不能做、加钱做',
    color: 0x315f9f,
    counters: ['scope'],
  },
  {
    id: 'walkaway',
    label: '体面拉倒',
    detail: '不签范围就先关单',
    color: 0x74405f,
    counters: ['scope', 'anger'],
  },
  {
    id: 'breathe',
    label: '缓一手',
    detail: '回耐心，少硬顶一回合',
    color: 0x4b5b65,
    counters: ['anger'],
  },
];
const STAGE_ZONES: StageZone[] = [
  {
    id: 'desk',
    title: '博哥工位',
    subtitle: '三群同时炸，先别回“可以”',
    act: '开场',
    x: 76,
    y: 332,
    w: 198,
    h: 92,
    accent: 0x2d83a5,
  },
  {
    id: 'finance',
    title: '财务账单桌',
    subtitle: 'GPU 钱从哪收',
    act: '第一幕',
    x: 292,
    y: 312,
    w: 188,
    h: 94,
    accent: 0xc98035,
  },
  {
    id: 'boss',
    title: '老板玻璃房',
    subtitle: '今天上线怎么说',
    act: '第二幕',
    x: 520,
    y: 174,
    w: 202,
    h: 112,
    accent: 0x3d6fa5,
  },
  {
    id: 'customer',
    title: '客户接待区',
    subtitle: '再梳一次，还是先收钱',
    act: '第三幕',
    x: 706,
    y: 326,
    w: 190,
    h: 98,
    accent: 0x2d8f73,
  },
  {
    id: 'briefing',
    title: '战前复盘桌',
    subtitle: '练报价、小范围试点、拉倒台阶',
    act: '终幕准备',
    x: 372,
    y: 468,
    w: 232,
    h: 80,
    accent: 0x7a542d,
  },
];
const ACTORS: ActorDefinition[] = [
  {
    id: 'finance',
    name: '财务姐',
    role: 'GPU 账单爆炸',
    x: 370,
    y: 348,
    beat: 'finance',
    tint: 0xf3b45f,
  },
  {
    id: 'finance',
    name: '财务姐',
    role: '谁批的预算',
    x: 370,
    y: 348,
    beat: 'financeAudit',
    tint: 0xf3b45f,
  },
  {
    id: 'boss',
    name: '老板',
    role: '今天必须上线',
    x: 622,
    y: 232,
    beat: 'boss',
    tint: 0x74a9ff,
  },
  {
    id: 'boss',
    name: '老板',
    role: '上线彩排',
    x: 622,
    y: 232,
    beat: 'bossRehearsal',
    tint: 0x74a9ff,
  },
  {
    id: 'customer',
    name: '客户姐',
    role: '再给我梳一次',
    x: 808,
    y: 366,
    beat: 'customer',
    tint: 0x66d4a5,
  },
  {
    id: 'customer',
    name: '客户姐',
    role: '免费全部上线反悔',
    x: 808,
    y: 366,
    beat: 'customerReversal',
    tint: 0x66d4a5,
  },
];
const HOTSPOTS: HotspotDefinition[] = [
  {
    id: 'desk',
    label: '博哥工位',
    x: 86,
    y: 328,
    w: 188,
    h: 104,
    kind: 'desk',
  },
  {
    id: 'ledger',
    label: '账单白板',
    x: 300,
    y: 226,
    w: 172,
    h: 66,
    kind: 'clue',
    clue: '成本三列表',
  },
  {
    id: 'whiteboard',
    label: '验收白板',
    x: 520,
    y: 94,
    w: 202,
    h: 72,
    kind: 'clue',
    clue: '验收三句话',
  },
  {
    id: 'contract',
    label: '范围单打印机',
    x: 724,
    y: 444,
    w: 158,
    h: 70,
    kind: 'clue',
    clue: '范围单模板',
  },
  {
    id: 'menu',
    label: '资料终端',
    x: 78,
    y: 210,
    w: 128,
    h: 70,
    kind: 'menu',
  },
  {
    id: 'briefing',
    label: '战前准备桌',
    x: 372,
    y: 468,
    w: 232,
    h: 80,
    kind: 'prep',
  },
];
const LEDGER_SORT_ITEMS: LedgerSortItem[] = [
  {
    id: 'gpu',
    label: 'GPU 峰值',
    source: '昨晚大模型跑满，账单突然抬头。',
    target: '加急服务包',
    line: '峰值不是说不清，是加急算力和跟进服务。',
    color: 0xc98035,
  },
  {
    id: 'trial',
    label: '试用额度',
    source: '客户还以为这次也算免费试用。',
    target: '基础服务包',
    line: '试用结束后继续跟进，就要转成基础服务。',
    color: 0x2d83a5,
  },
  {
    id: 'free',
    label: '补偿上限',
    source: '可以给一次台阶，但不能无限续杯。',
    target: '免费额度线',
    line: '免费不是没有，免费要写上限。',
    color: 0x2d8f73,
  },
];
const BOSS_LAUNCH_PRESSURES: BossLaunchPressure[] = [
  {
    id: 'time',
    label: '现场时间',
    quote: '客户下午来',
    pressure: '这不是普通催促，是把所有话压到今天必须能落地。',
    lane: '先定验收',
    color: 0xf7d66d,
  },
  {
    id: 'promise',
    label: '上线承诺',
    quote: 'Agent 今天上线',
    pressure: '上线两个字如果不拆范围，晚上就会自动变成全部上线。',
    lane: '缩成试点',
    color: 0x7be0c6,
  },
  {
    id: 'face',
    label: '老板体面',
    quote: '话要能播',
    pressure: '老板要漂亮说法，博哥要活路，不能只靠一句我来扛。',
    lane: '别说太满',
    color: 0xff9fc8,
  },
];
const BOSS_LAUNCH_ROUTES: BossLaunchRoute[] = [
  {
    decision: 'boss:scope',
    label: '先定验收说法',
    route: '边界',
    boLine: '今天能说上线，但先写清验收口子。',
    gain: '先把上线拆成可验收的说法。',
    risk: '老板会觉得不够漂亮。',
    endgame: '终幕客户追责时，边界起点更稳。',
    color: 0x8fb8ff,
  },
  {
    decision: 'boss:poc',
    label: '只承诺小范围试点',
    route: '稳住',
    boLine: '今天交付小范围试点，不承诺全部上线。',
    gain: '把今天上线缩成能交付的一段。',
    risk: '客户可能继续问为什么不是全部。',
    endgame: '终幕信任更稳，范围不会一开局爆炸。',
    color: 0x2d8f73,
  },
  {
    decision: 'boss:hard',
    label: '硬接全部上线',
    route: '冒险',
    boLine: '我接，但风险先记下来。',
    gain: '老板当场满意，现金压力好看。',
    risk: '晚上客户会拿全部上线追你。',
    endgame: '终幕范围压力更大，但钱更快进账。',
    color: 0xc98035,
  },
];
const CUSTOMER_JOKE_FRAGMENTS: CustomerJokeFragment[] = [
  {
    id: 'price',
    quote: '这姐咋收钱啊？',
    pressure: '客户不是不懂钱，是在问这次到底算不算收费服务。',
    lane: '报价',
    color: 0xf7d66d,
  },
  {
    id: 'compensation',
    quote: '再给你梳一次',
    pressure: '可以给一次台阶，但这句话不能自动变成全部上线。',
    lane: '补一次',
    color: 0x7be0c6,
  },
  {
    id: 'walkaway',
    quote: '不行拉倒吧',
    pressure: '拉倒不是摔门，是要留证据、留台阶、留后续报价。',
    lane: '拉倒',
    color: 0xff9fc8,
  },
];
const CUSTOMER_JOKE_ROUTES: CustomerJokeRoute[] = [
  {
    decision: 'customer:quote',
    label: '先把钱说清',
    route: '报价',
    boLine: '这次可以梳，但先按基础包和加急包算清楚。',
    gain: '免费售后变成可收费服务。',
    risk: '客户会顶一句：以前不是免费吗？',
    endgame: '终幕预算起点更高，怒气也会抬头。',
    color: 0xc98035,
  },
  {
    decision: 'customer:compensate',
    label: '补一次，但签范围',
    route: '补偿',
    boLine: '我再帮你梳一次，但只按小范围试点来。',
    gain: '先保关系，把补偿写小一点。',
    risk: '如果不守住，客户会顺手要全部上线。',
    endgame: '终幕信任更高，需求也更容易膨胀。',
    color: 0x2d8f73,
  },
  {
    decision: 'customer:walkaway',
    label: '不签范围就先停',
    route: '拉倒',
    boLine: '范围不签，就先体面拉倒，后面按单子谈。',
    gain: '边界最清楚，不再靠情分硬扛。',
    risk: '客户会冷一下，后面更难哄。',
    endgame: '终幕边界更稳，关系更脆。',
    color: 0x8a4e75,
  },
];
const CUSTOMER_REVERSAL_PRESSURES: CustomerReversalPressure[] = [
  {
    id: 'free',
    label: '免费口子',
    quote: '再给我梳一次',
    pressure: '客户把一次补偿说成默认售后，如果不收口，后面会一直续。',
    lane: '补一次要写小',
    color: 0x7be0c6,
  },
  {
    id: 'scope',
    label: '顺手上线',
    quote: '今天顺手全部上线吧',
    pressure: '顺手两个字最贵，会把小范围试点吹成全部交付。',
    lane: '范围先拆开',
    color: 0xf7d66d,
  },
  {
    id: 'walkaway',
    label: '退场威胁',
    quote: '不行就拉倒',
    pressure: '拉倒不是让博哥摔门，是逼他把规则说得体面。',
    lane: '拉倒留台阶',
    color: 0xff9fc8,
  },
];
const CUSTOMER_REVERSAL_ROUTES: CustomerReversalRoute[] = [
  {
    decision: 'customerReversal:quote-table',
    opening: 'customer:quote',
    label: '拿出报价表开谈',
    route: '报价',
    boLine: '免费全部上线先拆成价格，再谈要不要继续。',
    gain: '预算起点更高，服务费先上桌。',
    risk: '客户怒气会高一点，要能解释值在哪。',
    endgame: '终幕从报价路线开局，收钱机会最好。',
    color: 0xc98035,
  },
  {
    decision: 'customerReversal:poc-only',
    opening: 'customer:compensate',
    label: '补一次，但只补试点',
    route: '补偿',
    boLine: '我再帮你梳一次，但只补小范围试点。',
    gain: '信任更高，补偿被写小。',
    risk: '如果后面守不住，补偿会越补越多。',
    endgame: '终幕从补偿路线开局，关系更稳。',
    color: 0x2d8f73,
  },
  {
    decision: 'customerReversal:walkaway-line',
    opening: 'customer:walkaway',
    label: '不签范围就体面拉倒',
    route: '拉倒',
    boLine: '范围不签，就先体面拉倒，后面按单子谈。',
    gain: '边界最清楚，不再靠情分硬扛。',
    risk: '关系会冷一下，后面更难哄。',
    endgame: '终幕从边界路线开局，拉倒更体面。',
    color: 0x8a4e75,
  },
];
const EVIDENCE_OPTIONS: Record<string, EvidenceOption[]> = {
  ledger: [
    {
      id: 'ledger:gpu-peak',
      label: 'GPU 峰值曲线',
      detail: '钱 +55，压力 -4',
      line: '账单不是说不清，是昨晚三轮大模型峰值叠上了试用额度。',
      effect: { cash: 55, pressure: -4 },
    },
    {
      id: 'ledger:trial-to-paid',
      label: '试用转正式单',
      detail: '钱 +45，边界 +5',
      line: '试用能补，但再往后就是正式跟进，不能继续用“顺手”糊过去。',
      effect: { cash: 45, boundary: 5 },
    },
    {
      id: 'ledger:free-cap',
      label: '免费额度红线',
      detail: '信任 +5，边界 +6，钱 -20',
      line: '免费不是没有，免费有额度。额度以外再讲情分，就是博哥自己掏命。',
      effect: { trust: 5, boundary: 6, cash: -20 },
    },
  ],
  whiteboard: [
    {
      id: 'whiteboard:poc-acceptance',
      label: '小范围试点验收句',
      detail: '信任 +8，压力 -3',
      line: '今天上线不是全部上线承诺，是小范围试点验收。说慢一点，客户就少误会一点。',
      effect: { trust: 8, pressure: -3 },
    },
    {
      id: 'whiteboard:rollback',
      label: '失败退路',
      detail: '边界 +8，耐心 -2',
      line: '能上线，也能回滚。退路写上，老板的体面和博哥的腰都保一截。',
      effect: { boundary: 8, patience: -2 },
    },
    {
      id: 'whiteboard:boss-script',
      label: '老板说法卡',
      detail: '钱 +35，压力 +4',
      line: '老板要一句能播出去的话。话说漂亮可以，但别把漂亮话当合同。',
      effect: { cash: 35, pressure: 4 },
    },
  ],
  contract: [
    {
      id: 'contract:three-column',
      label: '能做/不能做/加钱做',
      detail: '边界 +10',
      line: '三列写清楚，客户就算不爽，也知道博哥不是凭感觉拒绝。',
      effect: { boundary: 10 },
    },
    {
      id: 'contract:comp-cap',
      label: '补偿上限条款',
      detail: '信任 +5，边界 +5，钱 -15',
      line: '补一次可以，但补偿要有上限。不然“再梳一次”会长出第二天。',
      effect: { trust: 5, boundary: 5, cash: -15 },
    },
    {
      id: 'contract:walkaway-proof',
      label: '拉倒留证据',
      detail: '边界 +8，压力 -5',
      line: '体面拉倒不是摆烂，是把已交付、未承诺、后续报价留成证据链。',
      effect: { boundary: 8, pressure: -5 },
    },
  ],
};
const PREP_OPTIONS: PrepOption[] = [
  {
    id: 'pricing-rehearsal',
    label: '演练收费说法',
    detail: '花 1 行动 · 钱 +45，边界 +4，清价格没说清',
    line: '博哥把“基础包、加急包、跟进包”念了三遍，下午不再一开口就像临时加钱。',
    effect: { cash: 45, boundary: 4 },
    clears: ['pricing-limbo'],
  },
  {
    id: 'poc-demo',
    label: '跑一遍小范围试点演示',
    detail: '花 1 行动 · 信任 +8，压力 -4，清全部上线承诺',
    line: '演示只保留小范围试点路径和回滚按钮，老板看着不够爽，但博哥晚上能睡。',
    effect: { trust: 8, pressure: -4 },
    clears: ['full-launch', 'overpromise'],
  },
  {
    id: 'walkaway-script',
    label: '写拉倒台阶',
    detail: '花 1 行动 · 边界 +10，耐心 -3',
    line: '拉倒不再是摔门，而是一段退场台词：已交付、未承诺、后续报价。',
    effect: { boundary: 10, patience: -3 },
  },
];

export function startYuanboGame(root: HTMLElement): () => void {
  let state = loadState();
  const size = getInitialGameSize();
  const shared: Shared = {
    boWalk: root.dataset.boWalkSrc || '/codex-pets/yuanbo-source2-walk-v2.png',
    boPortraits:
      root.dataset.boPortraitsSrc || '/codex-pets/yuanbo-source2-portraits-v2.png',
    expertBo: root.dataset.boSrc || '/codex-pets/expertbo-cutout.png',
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    save: () => persistState(state),
  };

  root.replaceChildren();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: root,
    width: size.width,
    height: size.height,
    backgroundColor: '#102526',
    pixelArt: false,
    roundPixels: false,
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: size.width,
      height: size.height,
    },
    scene: [new BootScene(shared), new PrologueScene(shared)],
  });

  const touch = createTouchControls(root, game);
  const resize = () => {
    const next = getInitialGameSize();
    game.scale.resize(next.width, next.height);
    const scene = game.scene.getScene('PrologueScene') as
      | PrologueScene
      | undefined;
    scene?.redraw();
  };
  window.addEventListener('resize', resize);
  persistState(state);

  return () => {
    window.removeEventListener('resize', resize);
    touch.remove();
    delete window.__YUANBO_PROLOGUE_QA__;
    game.destroy(true);
  };
}

class BootScene extends Phaser.Scene {
  constructor(private readonly shared: Shared) {
    super('BootScene');
  }

  preload(): void {
    this.load.spritesheet('boWalk', this.shared.boWalk, {
      frameWidth: BO_FRAME_W,
      frameHeight: BO_FRAME_H,
    });
    this.load.spritesheet('boPortraits', this.shared.boPortraits, {
      frameWidth: BO_PORTRAIT_W,
      frameHeight: BO_PORTRAIT_H,
    });
    this.load.image('expertBo', this.shared.expertBo);
  }

  create(): void {
    createBoAnimations(this);
    createNpcTextures(this);
    this.scene.start('PrologueScene');
  }
}

class PrologueScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private shadow?: Phaser.GameObjects.Ellipse;
  private boThought?: Phaser.GameObjects.Container;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private virtual = { x: 0, y: 0 };
  private moveVector = new Phaser.Math.Vector2(0, 0);
  private clickTarget?: Phaser.Math.Vector2;
  private clickMarker?: Phaser.GameObjects.Arc;
  private pendingInteraction?: { id: string; kind: 'actor' | 'hotspot' };
  private nearest?: InteractionTarget;
  private hint?: Phaser.GameObjects.Text;
  private targetGuideBox?: Phaser.GameObjects.Rectangle;
  private targetGuideText?: Phaser.GameObjects.Text;
  private modal?: Phaser.GameObjects.Container;
  private modalTitle = '';
  private modalBody = '';
  private modalChoices: DialogChoice[] = [];
  private modalManagementHint?: ManagementHint;
  private modalBlocking = false;
  private activeBridge?: BeatBridge;
  private activeOutcome?: ChoiceOutcomeCard;
  private activePhaseBreak?: PhaseBreakCard;

  constructor(private readonly shared: Shared) {
    super('PrologueScene');
  }

  create(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys(
      'W,A,S,D,E,SPACE,ENTER,ESC,M',
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard?.on('keydown-E', () => this.interact());
    this.input.keyboard?.on('keydown-SPACE', () => this.interact());
    this.input.keyboard?.on('keydown-ENTER', () => this.chooseDialog(0));
    this.input.keyboard?.on('keydown-M', () => this.showMenu());
    this.input.keyboard?.on('keydown-ESC', () => this.closeModal());
    this.input.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        gameObjects: Phaser.GameObjects.GameObject[],
      ) => {
        if (gameObjects.length) return;
        this.setClickTarget(pointer);
      },
    );
    this.installQa();
    this.redraw();
    if (!this.state().log.length) this.playOpening();
  }

  update(_time: number, delta: number): void {
    if (this.state().mode !== 'map' || this.modal) {
      this.player?.setVelocity(0, 0);
      return;
    }
    this.updatePlayer(delta);
    this.updateNearest();
    this.tryPendingInteraction();
  }

  redraw(): void {
    this.children.removeAll();
    this.modal = undefined;
    this.modalTitle = '';
    this.modalBody = '';
    this.modalChoices = [];
    this.modalManagementHint = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.moveVector.set(0, 0);
    this.clickTarget = undefined;
    this.clickMarker = undefined;
    this.pendingInteraction = undefined;
    this.targetGuideBox = undefined;
    this.targetGuideText = undefined;
    this.boThought = undefined;
    const state = this.state();
    if (state.mode === 'battle') {
      this.drawBattle();
      return;
    }
    if (state.mode === 'ending') {
      this.drawEnding();
      return;
    }
    this.drawWorld();
  }

  setVirtualVector(x: number, y: number): void {
    this.virtual = { x, y };
    if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) this.clearClickTarget();
  }

  currentInteractionLabel(): string {
    if (this.state().mode === 'battle') return '谈判';
    if (this.state().mode === 'ending') return '复盘';
    return this.nearest ? '互动' : '走近';
  }

  interact(): void {
    if (this.modal) {
      this.chooseDialog(0);
      return;
    }
    const state = this.state();
    if (state.mode === 'battle' || state.mode === 'ending') return;
    this.updateNearest();
    if (!this.nearest) {
      this.showDialog('还差两步', '走近有名字的角色或物件再按互动。', [
        { label: '知道了', action: () => this.closeModal() },
      ]);
      return;
    }
    if (this.nearest.actor) this.talkToActor(this.nearest.actor);
    else if (this.nearest.hotspot) this.useHotspot(this.nearest.hotspot);
  }

  private state(): PrologueState {
    return this.shared.getState();
  }

  private setState(next: PrologueState): void {
    this.shared.setState(next);
    this.shared.save();
  }

  private playOpening(): void {
    const state = this.state();
    state.log = [
      'DAY 1：博哥在云售后办公室醒来，财务群、老板群、客户语音同时弹到工位。',
    ];
    this.setState(state);
    this.showDialog(
      '第一天：这姐咋收钱啊',
      '09:17 / 工位亮屏。博哥刚坐下，屏幕上同时跳出三条未读：财务要账、老板催上线、客户要免费再梳一次。博哥把“可以”咽回去，先看清今天到底从哪里开始裂。',
      [
        {
          label: '走到工位',
          detail: '看三条未读',
          action: () => this.closeModal(),
        },
      ],
      'bo',
    );
  }

  private drawWorld(): void {
    document.querySelector('.yrpg-touch-bridge')?.removeAttribute('hidden');
    this.cameras.main.setBackgroundColor('#122f30');
    this.cameras.main.stopFollow();
    this.cameras.main.setScroll(0, 0);
    this.physics.world.setBounds(0, 0, GAME_W, WORLD_H);
    this.drawOffice();
    this.drawSceneStage();
    this.drawHotspots();
    this.drawActors();
    this.createPlayer();
    this.drawHud();
    this.updateNearest();
  }

  private drawOffice(): void {
    const state = this.state();
    if (state.beat === 'wake') {
      this.drawWakeOffice();
      return;
    }
    const activeZone = activeZoneForBeat(state.beat);
    const visibleZones = visibleStageZones(state.beat);
    const g = this.add.graphics();
    const stageColor = stageBackdropColor(activeZone);
    g.fillStyle(0x0b2022, 1).fillRect(0, 0, GAME_W, WORLD_H);
    g.fillStyle(stageColor.dark, 1).fillRoundedRect(42, 82, 876, 512, 14);
    g.fillStyle(stageColor.floor, 1).fillRoundedRect(58, 98, 844, 470, 12);
    g.lineStyle(1, stageColor.grid, 0.16);
    for (let x = 86; x <= 874; x += 58) g.lineBetween(x, 112, x, 548);
    for (let y = 128; y <= 536; y += 58) g.lineBetween(72, y, 888, y);
    g.fillStyle(0x071719, 0.2).fillRoundedRect(78, 116, 804, 414, 12);
    g.lineStyle(2, stageColor.accent, 0.3).strokeRoundedRect(78, 116, 804, 414, 12);
    this.drawStageComposition(state);
    this.drawActSpine(activeZone);
    visibleZones.forEach((zone) =>
      this.drawStageZone(
        zone,
        zone.id === activeZone,
        zoneCompleted(zone.id, state.beat),
        state.beat,
      ),
    );
    this.drawFloorActTrail(activeZone);
  }

  private drawWakeOffice(): void {
    const mobile = this.isPortrait();
    const layout = this.openingStageLayout();
    const worldW = mobile ? this.scale.width : GAME_W;
    const g = this.add.graphics();
    g.fillStyle(0x071719, 1).fillRect(0, 0, worldW, WORLD_H);
    g.fillStyle(0x0e292b, 1).fillRoundedRect(
      mobile ? 18 : 58,
      mobile ? 94 : 104,
      mobile ? worldW - 36 : 844,
      mobile ? 466 : 456,
      14,
    );
    g.lineStyle(1, 0x7be0c6, 0.08);
    for (let x = mobile ? 42 : 82; x <= worldW - 28; x += 58)
      g.lineBetween(x, 122, x, 544);
    for (let y = 128; y <= 536; y += 58) g.lineBetween(70, y, 890, y);

    if (!mobile) {
      g.fillStyle(0x051112, 0.52).fillRoundedRect(452, 136, 310, 106, 12);
      g.fillStyle(0x102b2e, 0.52).fillRoundedRect(468, 152, 278, 72, 8);
      g.fillStyle(0x051112, 0.42).fillRoundedRect(612, 356, 228, 92, 12);
      g.fillStyle(0x102b2e, 0.44).fillRoundedRect(628, 372, 196, 54, 8);
    }

    const desk = layout.desk;
    g.fillStyle(0xffdf86, 0.12).fillEllipse(
      desk.x + desk.w / 2,
      desk.y + desk.h * 0.68,
      mobile ? 260 : 318,
      mobile ? 128 : 150,
    );
    g.lineStyle(3, 0xffdf86, 0.46).strokeRoundedRect(
      desk.x - 18,
      desk.y - 30,
      desk.w + 40,
      desk.h + 54,
      16,
    );
    g.fillStyle(0xf3d083, 1).fillRoundedRect(desk.x, desk.y, desk.w, 58, 8);
    g.fillStyle(0x102526, 1).fillRoundedRect(desk.x + 24, desk.y + 12, 86, 36, 5);
    g.fillStyle(0x7be0c6, 1).fillRoundedRect(desk.x + 36, desk.y + 23, 58, 6, 2);
    g.fillStyle(0xffdf86, 1).fillRoundedRect(desk.x + desk.w - 58, desk.y + 10, 44, 30, 5);
    g.lineStyle(2, 0xe26b4d, 0.9).lineBetween(
      desk.x + desk.w - 54,
      desk.y + 36,
      desk.x + desk.w - 16,
      desk.y + 14,
    );
    g.fillStyle(0x0b2224, 0.92).fillRoundedRect(desk.x + 20, desk.y + 62, 96, 18, 5);
    g.fillStyle(0x2d83a5, 0.92).fillCircle(desk.x + desk.w - 48, desk.y + 71, 7);
    g.fillStyle(0xc98035, 0.92).fillCircle(desk.x + desk.w - 26, desk.y + 71, 7);
    g.fillStyle(0x2d8f73, 0.92).fillCircle(desk.x + desk.w - 4, desk.y + 71, 7);

    this.add
      .text(desk.x + 24, desk.y - 24, '工位亮屏', textStyle(14, '#ffe6a8', '950', '#102526'))
      .setDepth(6);
    this.drawOpeningPressureSources(layout);
    this.drawOpeningPressureStage();
  }

  private drawOpeningPressureStage(): void {
    const mobile = this.isPortrait();
    const layout = this.openingStageLayout();
    const g = this.add.graphics().setDepth(5);
    const { x, y, w, h } = layout;
    g.fillStyle(0x071719, 0.62).fillRoundedRect(x - 12, y - 12, w + 24, h + 24, 14);
    g.fillStyle(0x102b2e, 0.96).fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, 0xffdf86, 0.76).strokeRoundedRect(x, y, w, h, 12);
    g.fillStyle(0xffdf86, 0.9).fillRoundedRect(x + 18, y + 18, w - 36, 16, 5);
    this.add
      .text(x + 24, y + 46, '三条事故同时进门', textStyle(mobile ? 15 : 18, '#ffe6a8', '950'))
      .setDepth(6)
      .setWordWrapWidth(w - 48);
    this.add
      .text(
        x + 24,
        y + 74,
        mobile
          ? wrapCjk('玩家不是在逛办公室，而是在决定第一句话先救钱、救上线，还是先稳客户。', 17)
          : '玩家不是在逛办公室，而是在决定第一句话先救钱、救上线，还是先稳客户。',
        textStyle(mobile ? 10 : 12, '#e9f8df', '900'),
      )
      .setDepth(6)
      .setLineSpacing(mobile ? 2 : 4)
      .setWordWrapWidth(w - 48);

    this.openingMessageTargets().forEach((item) => {
      const row = this.add
        .rectangle(item.x, item.y, item.w, item.h, 0x0b2224, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, item.color, 0.72)
        .setDepth(6)
        .setInteractive({ useHandCursor: true });
      row.on('pointerover', () => {
        row.setFillStyle(0x14393b, 0.98);
        row.setStrokeStyle(2, item.color, 0.96);
      });
      row.on('pointerout', () => {
        row.setFillStyle(0x0b2224, 0.96);
        row.setStrokeStyle(1, item.color, 0.72);
      });
      row.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event?.stopPropagation();
        this.chooseOpeningMessage(item.id);
      });
      g.fillStyle(item.color, 0.95).fillCircle(item.x + 14, item.y + item.h / 2, 5);
      this.add
        .text(
          item.x + 28,
          item.y + 5,
          mobile
            ? wrapCjk(`${item.from}：${item.line}`, 15)
            : `${item.from}：${item.line}`,
          textStyle(mobile ? 9 : 10, '#fff8dc', '950'),
        )
        .setDepth(6)
        .setWordWrapWidth(item.w - (mobile ? 82 : 112));
      this.add
        .text(
          item.x + item.w - 12,
          item.y + 6,
          mobile ? '回' : '点击回复',
          textStyle(mobile ? 8 : 9, '#102526', '950', colorTextBg(item.color)),
        )
        .setOrigin(1, 0)
        .setDepth(7);
      g.lineStyle(1, item.color, 0.42).lineBetween(
        item.x,
        item.y + item.h / 2,
        layout.desk.x + layout.desk.w / 2,
        layout.desk.y + 60,
      );
    });

    const callout = this.add.container(layout.callout.x, layout.callout.y).setDepth(7);
    callout.add(
      this.add
        .rectangle(0, 0, mobile ? 214 : 194, 44, 0x0b2224, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x7be0c6, 0.74),
    );
    callout.add(
      this.add
        .text(14, 8, '博哥先别回“可以”', textStyle(12, '#ffe6a8', '950'))
        .setWordWrapWidth(166),
    );
    callout.add(
      this.add
        .text(14, 25, '先读工位屏幕，选第一句话。', textStyle(9, '#d7f3e9', '850'))
        .setWordWrapWidth(mobile ? 186 : 166),
    );
  }

  private openingStageLayout(): OpeningStageLayout {
    const mobile = this.isPortrait();
    const w = mobile ? Math.min(this.scale.width - 36, 354) : 386;
    const x = mobile ? Math.max(18, (this.scale.width - w) / 2) : 402;
    const y = mobile ? 116 : 166;
    const deskW = mobile ? 176 : 178;
    const deskX = mobile ? Math.max(44, this.scale.width / 2 - deskW / 2) : 92;
    const deskY = mobile ? 338 : 342;
    return {
      x,
      y,
      w,
      h: mobile ? 188 : 226,
      desk: {
        x: deskX,
        y: deskY,
        w: deskW,
        h: 94,
      },
      callout: {
        x: mobile ? Math.max(28, this.scale.width / 2 - 107) : 118,
        y: mobile ? deskY - 22 : 252,
      },
    };
  }

  private drawOpeningPressureSources(layout: OpeningStageLayout): void {
    const mobile = this.isPortrait();
    if (!mobile) return;
    const sources = OPENING_INBOX.map((item, index) => ({
      ...item,
      x: mobile
        ? layout.desk.x + [8, layout.desk.w / 2 - 34, layout.desk.w - 76][index]
        : [326, 404, 482][index],
      y: mobile
        ? layout.desk.y + layout.desk.h + 30 + (index % 2) * 36
        : [356, 402, 356][index],
    }));
    sources.forEach((item) => {
      const cardW = mobile ? 76 : 92;
      const cardH = mobile ? 34 : 42;
      const card = this.add.container(item.x, item.y).setDepth(8);
      card.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x071719, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(1, item.color, 0.82),
      );
      card.add(this.add.circle(10, 12, 5, item.color, 0.95));
      card.add(
        this.add
          .text(20, 5, item.from, textStyle(mobile ? 8 : 9, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 26),
      );
      card.add(
        this.add
          .text(
            8,
            mobile ? 19 : 22,
            mobile ? wrapCjk(item.title, 4) : item.title,
            textStyle(mobile ? 8 : 9, '#d7f3e9', '850'),
          )
          .setWordWrapWidth(cardW - 16),
      );
      this.add.graphics({ x: 0, y: 0 })
        .setDepth(7)
        .lineStyle(1, item.color, 0.34)
        .lineBetween(
          item.x + cardW / 2,
          item.y,
          layout.desk.x + layout.desk.w / 2,
          layout.desk.y + 70,
        );
    });
  }

  private openingMessageTargets(): OpeningMessageTarget[] {
    const mobile = this.isPortrait();
    const layout = this.openingStageLayout();
    return OPENING_INBOX.map((item, index) => ({
      ...item,
      x: layout.x + 24,
      y: layout.y + (mobile ? 106 : 122) + index * (mobile ? 25 : 30),
      w: layout.w - 48,
      h: 24,
      decision: `opening:${item.id}` as OpeningMessageTarget['decision'],
    }));
  }

  private chooseOpeningMessage(id: OpeningInboxItem['id']): void {
    if (this.modal || this.state().mode !== 'map' || this.state().beat !== 'wake')
      return;
    const target = this.openingMessageTargets().find((item) => item.id === id);
    if (!target) return;
    this.clearClickTarget();
    this.applyStoryChoice(target.decision, 'finance');
  }

  private showOpeningInboxBoard(): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '博哥工位：三条未读工单';
    this.modalBody = '屏幕上三条消息同时亮着。第一句先回谁，会决定下午谈判从哪里开始裂。';
    this.modalManagementHint = undefined;
    this.modalChoices = OPENING_INBOX_CHOICES.map((choice) => ({
      label: choice.label,
      detail: choice.route,
      action: () => this.applyStoryChoice(choice.decision, 'finance'),
    }));
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 820);
    const boxH = Math.min(h - 42, mobile ? 704 : 430);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xf7d66d, 0.9),
    );
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, y + 26, 104, 'bo'));
    const textX = mobile ? x + 22 : x + 148;
    const textW = mobile ? boxW - 44 : boxW - 170;
    c.add(
      this.add
        .text(textX, y + 18, '三条未读工单', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
        .setWordWrapWidth(textW),
    );
    const intro = this.add
      .text(
        textX,
        y + (mobile ? 56 : 58),
        mobile
          ? wrapCjk('财务、老板、客户同时亮屏。先回哪一条，今天就从哪一条裂开。', 23)
          : '财务、老板、客户同时亮屏。先回哪一条，今天就从哪一条裂开。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(textW);
    fitText(intro, textW, mobile ? 44 : 30, mobile ? 11 : 12, 8);
    c.add(intro);
    this.drawOpeningInboxBoardCards(
      c,
      x + 22,
      y + (mobile ? 112 : 138),
      boxW - 44,
      mobile ? boxH - 166 : 210,
      mobile,
    );
    const hint = this.add
      .text(
        x + 22,
        y + boxH - 36,
        '博哥：先别都回可以。第一句话先定调，后面的钱、上线、补一次都会跟着偏。',
        textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
      )
      .setWordWrapWidth(boxW - 44);
    fitText(hint, boxW - 44, 18, mobile ? 10 : 11, 8);
    c.add(hint);
    this.modal = c;
  }

  private drawOpeningInboxBoardCards(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    OPENING_INBOX_CHOICES.forEach((choice, index) => {
      const inbox = OPENING_INBOX.find((item) => item.id === choice.id)!;
      const cx = x + (index % cols) * (cardW + gap);
      const cy = y + Math.floor(index / cols) * (cardH + gap);
      const card = this.add.container(cx, cy).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x0d2528, 0.99)
          .setOrigin(0, 0)
          .setStrokeStyle(2, choice.color, 0.86),
      );
      card.add(this.add.rectangle(0, 0, 8, cardH, choice.color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(18, 9, inbox.from, textStyle(8, '#102526', '950', colorTextBg(choice.color)))
          .setWordWrapWidth(cardW - 36),
      );
      card.add(
        this.add
          .text(18, mobile ? 28 : 34, `${inbox.title}：${inbox.line}`, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 36),
      );
      const bo = this.add
        .text(
          18,
          mobile ? 54 : 70,
          `博哥：${mobile ? wrapCjk(choice.boLine, 24) : choice.boLine}`,
          textStyle(mobile ? 10 : 11, '#fff8dc', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 36);
      fitText(bo, cardW - 36, mobile ? 30 : 36, mobile ? 10 : 11, 8);
      card.add(bo);
      const result = this.add
        .text(
          18,
          mobile ? 88 : 118,
          `${choice.gain}\n代价：${choice.risk}`,
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(cardW - 36);
      fitText(result, cardW - 36, cardH - (mobile ? 96 : 128), mobile ? 9 : 10, 7);
      card.add(result);
      card.setSize(cardW, cardH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardW, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.01));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.chooseDialog(index);
      });
      parent.add(card);
    });
  }

  private drawStageComposition(state: PrologueState): void {
    const cue = SCENE_CUES[state.beat];
    if (!cue || state.beat === 'wake') return;
    const mobile = this.isPortrait();
    if (mobile) return;
    const composition = stageComposition(state);
    const accent = setPieceColor(composition.tone);
    const memories = composition.residue.slice(0, mobile ? 1 : 3);
    const panelW = mobile ? 254 : 286;
    const panelH = mobile ? 118 : 144;
    const leftSide = cue.focus.x + cue.focus.w / 2 > GAME_W / 2;
    const x = mobile
      ? clamp(cue.focus.x - 18, 28, GAME_W - panelW - 28)
      : leftSide
        ? 118
        : GAME_W - panelW - 118;
    const y = mobile
      ? Math.max(142, cue.focus.y - 88)
      : clamp(cue.focus.y + cue.focus.h / 2 - panelH / 2, 126, 430);
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x061718, 0.58).fillRoundedRect(x - 10, y - 10, panelW + 20, panelH + 20, 12);
    g.fillStyle(0x0b2224, 0.95).fillRoundedRect(x, y, panelW, panelH, 10);
    g.lineStyle(2, accent, 0.68).strokeRoundedRect(x, y, panelW, panelH, 10);
    g.fillStyle(accent, 0.92).fillRoundedRect(x + 12, y + 12, panelW - 24, 12, 4);
    this.add
      .text(x + 18, y + 32, composition.title, textStyle(mobile ? 12 : 13, '#ffe6a8', '950'))
      .setDepth(5)
      .setWordWrapWidth(panelW - 36);
    this.add
      .text(
        x + 18,
        y + (mobile ? 53 : 55),
        `${composition.antagonist}：${composition.conflict}`,
        textStyle(mobile ? 9 : 10, '#f4f1d9', '900'),
      )
      .setDepth(5)
      .setLineSpacing(3)
      .setWordWrapWidth(panelW - 36);
    this.add
      .text(
        x + 18,
        y + (mobile ? 82 : 86),
        `博哥要做：${composition.playerTask}`,
        textStyle(mobile ? 9 : 10, '#9ee8d1', '900'),
      )
      .setDepth(5)
      .setLineSpacing(3)
      .setWordWrapWidth(panelW - 36);
    if (!mobile) {
      this.add
        .text(
          x + 18,
          y + 116,
          `证据：${composition.evidence}`,
          textStyle(9, '#fff3c9', '850'),
        )
        .setDepth(5)
        .setWordWrapWidth(panelW - 36);
    }
    memories.forEach((memory, index) => {
      const chipW = mobile ? 116 : 84;
      const chipX = x + panelW - 18 - chipW - index * (chipW + 6);
      const chipY = y + panelH + 12;
      this.drawSetTag(chipX, chipY, memory, accent, chipW, 8);
    });
    g.lineStyle(2, accent, 0.36).lineBetween(
      x + (leftSide ? panelW : 0),
      y + panelH / 2,
      cue.focus.x + cue.focus.w / 2,
      cue.focus.y + cue.focus.h / 2,
    );
  }

  private drawActSpine(activeZone: ZoneId): void {
    const g = this.add.graphics().setDepth(1);
    const x = 96;
    const y = 586;
    const w = 768;
    const h = 34;
    g.fillStyle(0x061718, 0.72).fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(1, 0x7be0c6, 0.28).strokeRoundedRect(x, y, w, h, 8);
    const zones: ZoneId[] = ['desk', 'finance', 'boss', 'customer', 'briefing'];
    zones.forEach((id, index) => {
      const zone = STAGE_ZONES.find((item) => item.id === id)!;
      const cx = x + 42 + index * 172;
      const active = id === activeZone;
      const done = zoneCompleted(id, this.state().beat);
      g.fillStyle(active ? zone.accent : done ? 0x7be0c6 : 0x38595a, active ? 1 : 0.68)
        .fillCircle(cx, y + h / 2, active ? 6 : 4);
      if (index < zones.length - 1) {
        g.lineStyle(2, done ? 0x7be0c6 : 0x38595a, done ? 0.62 : 0.3)
          .lineBetween(cx + 12, y + h / 2, cx + 150, y + h / 2);
      }
      if (active) {
        this.add
          .text(cx + 14, y + 8, `${zone.act}：${zone.title}`, textStyle(10, '#fff8dc', '950'))
          .setDepth(2)
          .setWordWrapWidth(130);
      }
    });
  }

  private drawFloorActTrail(activeZone: ZoneId): void {
    const current = zoneCenter(activeZone);
    const g = this.add.graphics().setDepth(2);
    const active = STAGE_ZONES.find((zone) => zone.id === activeZone);
    g.fillStyle(0xffdf86, 0.12).fillEllipse(current.x, current.y + 62, 220, 34);
    g.lineStyle(3, active?.accent || 0xffdf86, 0.34);
    g.strokeRoundedRect(current.x - 118, current.y - 74, 236, 132, 14);
  }

  private drawStageZone(
    zone: StageZone,
    active: boolean,
    completed: boolean,
    beat: Beat,
  ): void {
    const mobile = this.isPortrait();
    const unlocked = zoneUnlocked(zone.id, beat);
    const g = this.add.graphics().setDepth(1);
    const alpha = active ? 0.98 : completed ? 0.26 : unlocked ? 0.14 : 0.08;
    const fill = active ? 0x17383b : completed ? 0x1b3434 : 0x243839;
    g.fillStyle(0x000000, 0.18).fillEllipse(
      zone.x + zone.w / 2,
      zone.y + zone.h + 13,
      zone.w * 0.72,
      18,
    );
    g.fillStyle(fill, alpha).fillRoundedRect(zone.x, zone.y, zone.w, zone.h, 8);
    g.lineStyle(active ? 3 : 1, active ? 0xffdf86 : zone.accent, active ? 0.92 : 0.18)
      .strokeRoundedRect(zone.x, zone.y, zone.w, zone.h, 8);
    if (active) {
      g.fillStyle(zone.accent, 0.92).fillRoundedRect(
        zone.x + 12,
        zone.y + 12,
        zone.w - 24,
        14,
        4,
      );
    } else if (completed) {
      g.fillStyle(0x7be0c6, 0.62).fillCircle(zone.x + zone.w - 16, zone.y + 18, 4);
    }
    this.drawZoneArt(zone, active, completed || !unlocked);
    if (active && !mobile && !storySetPieceForBeat(beat)) {
      const titleStyle = textStyle(
        13,
        '#fff8dc',
        '950',
        '#173538',
      );
      this.add
        .text(
          zone.x + zone.w / 2,
          zone.y - 18,
          `${zone.act}：${zone.title}`,
          titleStyle,
        )
        .setOrigin(0.5)
        .setDepth(12);
      this.add
        .text(
          zone.x + 16,
          zone.y + zone.h - 28,
          zone.subtitle,
          textStyle(10, '#fff8dc', '900'),
        )
        .setWordWrapWidth(zone.w - 32)
        .setDepth(12);
    }
    if (active) {
      const pulse = this.add
        .rectangle(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w + 16, zone.h + 16, 0xffdf86, 0.08)
        .setStrokeStyle(2, 0xffdf86, 0.72)
        .setDepth(3);
      this.tweens.add({ targets: pulse, alpha: 0.24, yoyo: true, repeat: -1, duration: 820 });
    }
  }

  private drawZoneArt(zone: StageZone, active: boolean, completed: boolean): void {
    const g = this.add.graphics().setDepth(active ? 7 : 3);
    const x = zone.x;
    const y = zone.y;
    const w = zone.w;
    const muted = active ? 1 : completed ? 0.34 : 0.24;
    if (zone.id === 'desk') {
      g.fillStyle(0xf3d083, muted).fillRoundedRect(x + 22, y + 36, w - 44, 22, 4);
      g.fillStyle(0x102526, muted).fillRoundedRect(x + 34, y + 48, 54, 22, 3);
      g.fillStyle(0x7be0c6, muted).fillRect(x + 42, y + 54, 34, 5);
      g.fillStyle(0xffdf86, muted).fillRoundedRect(x + 106, y + 42, 54, 28, 4);
      g.lineStyle(2, 0xe26b4d, muted).lineBetween(x + 112, y + 62, x + 154, y + 48);
      return;
    }
    if (zone.id === 'finance') {
      g.fillStyle(0xfff0b8, muted).fillRoundedRect(x + 20, y + 36, w - 40, 34, 4);
      g.lineStyle(3, 0xe26b4d, muted).lineBetween(x + 34, y + 64, x + w - 34, y + 42);
      g.fillStyle(0xc98035, muted).fillRoundedRect(x + 34, y + 72, 44, 7, 2);
      g.fillStyle(0x2d83a5, muted).fillRoundedRect(x + 86, y + 72, 54, 7, 2);
      return;
    }
    if (zone.id === 'boss') {
      g.fillStyle(0x0c2227, muted).fillRoundedRect(x + 26, y + 38, w - 52, 38, 4);
      g.fillStyle(0x7be0c6, muted).fillRect(x + 42, y + 52, 80, 7);
      g.fillStyle(0xffdf86, muted).fillRect(x + 42, y + 66, 62, 7);
      g.fillStyle(0x315f9f, muted).fillRoundedRect(x + w - 54, y + 42, 24, 34, 4);
      return;
    }
    if (zone.id === 'customer') {
      g.fillStyle(0xf6c77b, muted).fillRoundedRect(x + 24, y + 36, w - 48, 32, 4);
      g.fillStyle(0x102526, muted).fillRoundedRect(x + 40, y + 46, 52, 8, 2);
      g.fillStyle(0x2d8f73, muted).fillRoundedRect(x + 106, y + 46, 42, 8, 2);
      g.lineStyle(2, 0xffdf86, muted).strokeRoundedRect(x + 26, y + 34, w - 52, 38, 5);
      return;
    }
    g.fillStyle(0x6b4b35, muted).fillRoundedRect(x + 24, y + 30, w - 48, 34, 5);
    g.fillStyle(0xffdf86, muted).fillRoundedRect(x + 44, y + 42, 62, 8, 2);
    g.fillStyle(0x7be0c6, muted).fillRoundedRect(x + 116, y + 42, 54, 8, 2);
  }

  private drawSceneStage(): void {
    const state = this.state();
    const cue = SCENE_CUES[state.beat];
    if (!cue) return;
    this.drawSceneMask(cue.focus);
    const hasSetPiece = Boolean(storySetPieceForBeat(state.beat));
    this.drawStorySetPiece(state.beat, cue);
    const focus = this.add
      .rectangle(
        cue.focus.x + cue.focus.w / 2,
        cue.focus.y + cue.focus.h / 2,
        cue.focus.w + 28,
        cue.focus.h + 24,
        0xffdf86,
        0.09,
      )
      .setStrokeStyle(3, 0xffdf86, 0.82)
      .setDepth(4);
    this.tweens.add({
      targets: focus,
      alpha: 0.38,
      yoyo: true,
      repeat: -1,
      duration: 900,
    });
    if (cue.prop === 'messages') return;
    if (!hasSetPiece) this.drawSceneProp(cue);
    if (!hasSetPiece) this.drawSceneCard(cue);
    if (!hasSetPiece)
      this.drawSceneEventBubbles(state.beat, cue);
  }

  private drawSceneMask(focus: SceneCue['focus']): void {
    const margin = 32;
    const left = Math.max(0, focus.x - margin);
    const right = Math.min(GAME_W, focus.x + focus.w + margin);
    const top = Math.max(0, focus.y - margin);
    const bottom = Math.min(WORLD_H, focus.y + focus.h + margin);
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x061718, 0.32);
    g.fillRect(0, 0, GAME_W, top);
    g.fillRect(0, bottom, GAME_W, WORLD_H - bottom);
    g.fillRect(0, top, left, bottom - top);
    g.fillRect(right, top, GAME_W - right, bottom - top);
  }

  private drawStorySetPiece(beat: Beat, cue: SceneCue): void {
    if (cue.prop === 'messages') return;
    const setPiece = storySetPieceForBeat(beat);
    if (!setPiece) return;
    const mobile = this.isPortrait();
    const accent = setPieceColor(setPiece.tone);
    const boxW = mobile ? Math.min(344, cue.focus.w + 118) : Math.max(360, cue.focus.w + 178);
    const boxH = mobile ? Math.max(206, cue.focus.h + 112) : 220;
    const x = clamp(
      cue.focus.x + cue.focus.w / 2 - boxW / 2,
      mobile ? 18 : 54,
      GAME_W - boxW - (mobile ? 18 : 54),
    );
    const y = clamp(
      cue.focus.y + cue.focus.h / 2 - boxH / 2,
      mobile ? 118 : 108,
      WORLD_H - boxH - 24,
    );
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x061718, 0.78).fillRoundedRect(x - 10, y - 10, boxW + 20, boxH + 20, 14);
    g.fillStyle(0x102b2e, 0.96).fillRoundedRect(x, y, boxW, boxH, 12);
    g.lineStyle(3, accent, 0.82).strokeRoundedRect(x, y, boxW, boxH, 12);
    g.fillStyle(accent, 0.94).fillRoundedRect(x + 14, y + 14, boxW - 28, 18, 5);
    g.fillStyle(0xffdf86, 0.12).fillEllipse(
      cue.focus.x + cue.focus.w / 2,
      cue.focus.y + cue.focus.h + 50,
      Math.min(boxW - 44, 280),
      36,
    );

    this.add
      .text(x + 24, y + 42, setPiece.title, textStyle(mobile ? 14 : 16, '#ffe6a8', '950'))
      .setDepth(6)
      .setWordWrapWidth(boxW - 48);
    const subtitle = this.add
      .text(
        x + 24,
        y + (mobile ? 62 : 64),
        mobile ? wrapCjk(setPiece.subtitle, 20) : setPiece.subtitle,
        textStyle(mobile ? 10 : 11, '#d7f3e9', '900'),
      )
      .setDepth(6)
      .setLineSpacing(3)
      .setWordWrapWidth(boxW - 48);
    fitText(subtitle, boxW - 48, mobile ? 36 : 28, mobile ? 10 : 11, 8);

    this.drawStorySetProps(x, y, boxW, setPiece, cue);
    this.drawSceneMemoryProps(x, y, boxW, boxH, sceneMemoryProps(this.state()));
  }

  private drawSceneMemoryProps(
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number,
    props: SceneMemoryProp[],
  ): void {
    if (!props.length) return;
    const mobile = this.isPortrait();
    if (mobile) {
      const visible = props.slice(-2);
      const gap = 6;
      const chipW = (boxW - 42 - gap * (visible.length - 1)) / visible.length;
      visible.forEach((prop, index) => {
        const x = boxX + 21 + index * (chipW + gap);
        const y = boxY + boxH - 34;
        this.drawSetTag(x, y, prop.label, prop.color, chipW, 7);
      });
      return;
    }
    const cardW = 164;
    const cardH = 38;
    const sideX =
      boxX + boxW + cardW + 18 <= GAME_W - 36
        ? boxX + boxW + 16
        : boxX - cardW - 16;
    const startY = clamp(
      boxY + (props.length >= 3 ? 36 : 86),
      118,
      WORLD_H - props.length * (cardH + 8) - 24,
    );
    props.forEach((prop, index) => {
      const x = sideX;
      const y = startY + index * (cardH + 8);
      const c = this.add.container(x, y).setDepth(9);
      c.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x0b2224, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(1, prop.color, 0.78),
      );
      c.add(this.add.rectangle(0, 0, 5, cardH, prop.color, 0.92).setOrigin(0, 0));
      c.add(
        this.add
          .text(12, 5, prop.label, textStyle(9, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 24),
      );
      const line = this.add
        .text(12, 19, wrapCjk(prop.line, 12), textStyle(8, '#d7f3e9', '850'))
        .setLineSpacing(1)
        .setWordWrapWidth(cardW - 24);
      fitText(line, cardW - 24, 15, 8, 6);
      c.add(line);
    });
  }

  private drawStorySetProps(
    x: number,
    y: number,
    boxW: number,
    setPiece: StorySetPiece,
    cue: SceneCue,
  ): void {
    const mobile = this.isPortrait();
    const accent = setPieceColor(setPiece.tone);
    const g = this.add.graphics().setDepth(6);
    const propY = y + (mobile ? 106 : 108);
    if (setPiece.tone === 'money') {
      const paperW = Math.min(168, boxW * 0.44);
      g.fillStyle(0xfff0b8, 0.96).fillRoundedRect(x + 24, propY, paperW, 64, 6);
      g.lineStyle(3, 0xe26b4d, 0.9).lineBetween(x + 42, propY + 48, x + paperW - 18, propY + 18);
      g.fillStyle(0x8f3e2d, 0.92).fillRoundedRect(x + 40, propY + 18, 52, 8, 2);
      g.fillStyle(0x2d83a5, 0.88).fillRoundedRect(x + 40, propY + 34, 88, 8, 2);
      if (mobile) return;
      this.drawSetTag(x + boxW - 150, propY + 4, setPiece.props[0], accent);
      this.drawSetTag(x + boxW - 150, propY + 38, setPiece.props[1], 0xe26b4d);
      this.drawSetTag(x + boxW - 150, propY + 72, setPiece.props[2], 0x2d83a5);
      return;
    }
    if (setPiece.tone === 'launch') {
      g.fillStyle(0x0b2224, 0.98).fillRoundedRect(x + 24, propY, boxW - 48, 70, 6);
      g.lineStyle(2, 0x7be0c6, 0.72).strokeRoundedRect(x + 24, propY, boxW - 48, 70, 6);
      const lanes = cue.prop === 'launch'
        ? ['今天上线', '小范围试点', '验收说法']
        : ['试点范围', '失败退路', '别说太满'];
      lanes.forEach((label, index) => {
        const lx = x + 44 + index * ((boxW - 88) / 3);
        g.fillStyle(index === 0 ? 0x315f9f : index === 1 ? 0x2d7163 : 0x8f6828, 0.92)
          .fillRoundedRect(lx, propY + 22, (boxW - 124) / 3, 18, 4);
        this.add
          .text(lx + 8, propY + 25, label, textStyle(9, '#fff8dc', '950'))
          .setDepth(7)
          .setWordWrapWidth((boxW - 142) / 3);
      });
      if (mobile) return;
      this.drawSetTag(x + 34, propY + 86, setPiece.props[0], accent);
      this.drawSetTag(x + boxW / 2 - 66, propY + 86, setPiece.props[1], 0xffdf86);
      this.drawSetTag(x + boxW - 166, propY + 86, setPiece.props[2], 0x7be0c6);
      return;
    }
    if (setPiece.tone === 'customer') {
      const tableW = Math.min(boxW - 70, 260);
      const tableY = propY + (mobile ? 44 : 26);
      const bubbleY = propY + (mobile ? -16 : 7);
      g.fillStyle(0xf6c77b, 0.96).fillRoundedRect(x + boxW / 2 - tableW / 2, tableY, tableW, 50, 8);
      g.fillStyle(0x102526, 0.92).fillRoundedRect(x + boxW / 2 - tableW / 2 + 20, tableY + 16, 66, 9, 3);
      g.fillStyle(0x2d8f73, 0.92).fillRoundedRect(x + boxW / 2 + 24, tableY + 16, 74, 9, 3);
      g.lineStyle(2, cue.prop === 'reversal' ? 0xe26b4d : 0x2d8f73, 0.9)
        .strokeRoundedRect(x + boxW / 2 - 74, bubbleY, 148, 34, 8);
      this.add
        .text(
          x + boxW / 2,
          bubbleY + 9,
          cue.prop === 'reversal' ? '顺手全部上线？' : '再梳一次？',
          textStyle(mobile ? 10 : 12, '#fff8dc', '950'),
        )
        .setOrigin(0.5)
        .setDepth(23);
      if (mobile) return;
      this.drawSetTag(x + 24, propY + 88, setPiece.props[0], accent);
      this.drawSetTag(x + boxW / 2 - 66, propY + 88, setPiece.props[1], 0x8f6828);
      this.drawSetTag(x + boxW - 156, propY + 88, setPiece.props[2], 0x315f9f);
      return;
    }
    g.fillStyle(0x6b4b35, 0.96).fillRoundedRect(x + 30, propY + 20, boxW - 60, 54, 8);
    if (mobile) return;
    this.drawSetTag(x + 42, propY + 88, setPiece.props[0], accent);
    this.drawSetTag(x + boxW / 2 - 58, propY + 88, setPiece.props[1], 0xffdf86);
    this.drawSetTag(x + boxW - 146, propY + 88, setPiece.props[2], 0x7be0c6);
  }

  private drawSetTag(
    x: number,
    y: number,
    label: string,
    color: number,
    width = 128,
    fontSize = 9,
  ): void {
    const tag = this.add.container(x, y).setDepth(7);
    tag.add(
      this.add
        .rectangle(0, 0, width, 26, 0x0b2224, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, color, 0.76),
    );
    tag.add(
      this.add
        .text(8, 6, label, textStyle(fontSize, '#fff8dc', '950'))
        .setWordWrapWidth(width - 16),
    );
  }

  private drawSceneCard(cue: SceneCue): void {
    const mobile = this.isPortrait();
    const cardW = mobile ? Math.min(320, this.scale.width - 36) : 316;
    const cardH = mobile ? 78 : 92;
    let x = cue.focus.x + cue.focus.w + 26;
    let scrollFactor = 1;
    if (mobile) {
      x = 18;
      scrollFactor = 0;
    } else {
      x =
        cue.focus.x + cue.focus.w / 2 < GAME_W / 2
          ? Math.min(GAME_W - cardW - 64, cue.focus.x + cue.focus.w + 86)
          : Math.max(64, cue.focus.x - cardW - 86);
    }
    let y = mobile
      ? 154
      : cue.focus.y + cue.focus.h + 16;
    if (mobile && y + cardH > WORLD_H - 18) y = cue.focus.y - cardH - 20;
    y = clamp(y, mobile ? 146 : 112, WORLD_H - cardH - 18);
    const g = this.add.graphics().setDepth(10).setScrollFactor(scrollFactor);
    g.fillStyle(0x0b2224, 0.94).fillRoundedRect(x, y, cardW, cardH, 8);
    g.lineStyle(2, 0xffdf86, 0.8).strokeRoundedRect(x, y, cardW, cardH, 8);
    if (!mobile) {
      g.lineStyle(2, 0xffdf86, 0.48).lineBetween(
        x + (x < cue.focus.x ? cardW : 0),
        y + cardH / 2,
        cue.focus.x + cue.focus.w / 2,
        cue.focus.y + cue.focus.h / 2,
      );
    }
    this.add
      .text(
        x + 18,
        y + 10,
        mobile ? cue.title : `现场冲突：${cue.title}`,
        textStyle(mobile ? 13 : 15, '#ffe6a8', '950'),
      )
      .setScrollFactor(scrollFactor)
      .setDepth(11);
    this.add
      .text(
        x + 18,
        y + (mobile ? 31 : 38),
        mobile ? wrapCjk(cue.line, 20) : cue.line,
        textStyle(mobile ? 11 : 12, '#e9f8df', '850'),
      )
      .setScrollFactor(scrollFactor)
      .setLineSpacing(3)
      .setWordWrapWidth(cardW - 36)
      .setDepth(11);
    if (!mobile) {
      this.add
        .text(
          x + 18,
          y + 68,
          `博哥心声：${cue.thought}`,
          textStyle(11, '#9ee8d1', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 36)
        .setDepth(11);
    }
  }

  private drawSceneEventBubbles(beat: Beat, cue: SceneCue): void {
    const events = SCENE_EVENTS[beat] || [];
    if (!events.length) return;
    const mobile = this.isPortrait();
    const list = events.slice(0, 1);
    const baseX = mobile
      ? 18
      : cue.focus.x + cue.focus.w / 2 < GAME_W / 2
        ? Math.min(GAME_W - 308, cue.focus.x + cue.focus.w + 34)
        : Math.max(36, cue.focus.x - 308);
    const baseY = mobile
      ? clamp(this.scale.height - 292, 338, 552)
      : clamp(cue.focus.y - 92, 136, WORLD_H - list.length * 42 - 16);
    const scrollFactor = mobile ? 0 : 1;
    list.forEach((event, index) => {
      const width = mobile ? Math.min(344, this.scale.width - 36) : 284;
      const height = mobile ? 30 : 34;
      const x = baseX;
      const y = baseY + index * (height + 6);
      const color = sceneEventColor(event.tone);
      const c = this.add.container(x, y).setDepth(13).setScrollFactor(scrollFactor);
      c.add(
        this.add
          .rectangle(0, 0, width, height, 0x0b2224, 0.94)
          .setOrigin(0, 0)
          .setStrokeStyle(1, color, 0.72),
      );
      c.add(
        this.add
          .rectangle(0, 0, 6, height, color, 0.92)
          .setOrigin(0, 0),
      );
      c.add(
        this.add
          .text(14, mobile ? 5 : 6, event.from, textStyle(9, '#ffe6a8', '950'))
          .setWordWrapWidth(54),
      );
      c.add(
        this.add
          .text(
            mobile ? 82 : 76,
            mobile ? 5 : 6,
            mobile ? wrapCjk(event.line, 18) : event.line,
            textStyle(mobile ? 9 : 10, '#f4f1d9', '850'),
          )
          .setLineSpacing(2)
          .setWordWrapWidth(width - (mobile ? 94 : 88)),
      );
      this.tweens.add({
        targets: c,
        y: y - 3,
        yoyo: true,
        repeat: -1,
        duration: 900 + index * 160,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private drawOpeningInbox(x: number, y: number): void {
    const mobile = this.isPortrait();
    const panelW = mobile ? 238 : 332;
    const panelH = mobile ? 88 : 112;
    const c = this.add
      .container(mobile ? x + 10 : x + 226, mobile ? y - 92 : y - 28)
      .setDepth(14);
    c.add(
      this.add
        .rectangle(4, 5, panelW, panelH, 0x000000, 0.18)
        .setOrigin(0, 0),
    );
    c.add(
      this.add
        .rectangle(0, 0, panelW, panelH, 0x0b2224, 0.97)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdf86, 0.84),
    );
    c.add(
      this.add
        .text(
          14,
          9,
          mobile ? '今天三方同时进门' : '09:17 / 今天三方同时进门',
          textStyle(mobile ? 11 : 13, '#ffe6a8', '950'),
        )
        .setWordWrapWidth(panelW - 28),
    );
    c.add(
      this.add
        .text(
          14,
          mobile ? 23 : 26,
          '工位收件箱 · 三条未读',
          textStyle(mobile ? 9 : 10, '#9ee8d1', '900'),
        )
        .setWordWrapWidth(panelW - 28),
    );
    OPENING_INBOX.forEach((item, index) => {
      const rowY = (mobile ? 39 : 48) + index * (mobile ? 15 : 19);
      c.add(
        this.add
          .circle(16, rowY + 5, 4, item.color, 0.96)
          .setStrokeStyle(1, 0xfff3c0, 0.78),
      );
      c.add(
        this.add
          .text(28, rowY, `${item.from}：${item.line}`, textStyle(mobile ? 9 : 10, '#f4f1d9', '900'))
          .setWordWrapWidth(panelW - 42),
      );
    });
    this.tweens.add({
      targets: c,
      y: c.y - 3,
      yoyo: true,
      repeat: -1,
      duration: 980,
      ease: 'Sine.easeInOut',
    });
  }

  private drawSceneProp(cue: SceneCue): void {
    const x = cue.focus.x;
    const y = cue.focus.y;
    const w = cue.focus.w;
    const prop = this.add.container(0, 0).setDepth(8);
    const addTag = (tx: number, ty: number, text: string, color = 0x2d83a5) => {
      const bg = this.add
        .rectangle(tx, ty, 132, 26, color, 0.96)
        .setStrokeStyle(1, 0xffdf86, 0.7);
      const label = this.add
        .text(tx, ty, text, textStyle(11, '#fff8dc', '950'))
        .setOrigin(0.5);
      prop.add([bg, label]);
    };
    if (cue.prop === 'messages') {
      this.drawOpeningInbox(x, y);
      return;
    }
    if (cue.prop === 'bill' || cue.prop === 'audit') {
      addTag(x + w / 2, y - 38, cue.prop === 'bill' ? 'GPU 峰值账单' : '谁来认预算', 0x8f3e2d);
      const g = this.add.graphics();
      g.fillStyle(0xfff0b8, 1).fillRoundedRect(x + 20, y + 10, w - 40, 38, 4);
      g.lineStyle(3, 0xe26b4d, 0.9).lineBetween(x + 34, y + 42, x + w - 34, y + 18);
      prop.add(g);
      return;
    }
    if (cue.prop === 'launch' || cue.prop === 'rehearsal') {
      addTag(x + w / 2, y - 38, cue.prop === 'launch' ? '今天上线' : '试点不等于全部上线', 0x315f9f);
      const g = this.add.graphics();
      g.fillStyle(0x0c2227, 1).fillRoundedRect(x + 24, y + 12, w - 48, 36, 4);
      g.fillStyle(0x7be0c6, 0.9).fillRect(x + 38, y + 26, cue.prop === 'launch' ? 72 : 42, 7);
      g.fillStyle(0xffdf86, 0.9).fillRect(x + 38, y + 38, cue.prop === 'launch' ? 42 : 76, 7);
      prop.add(g);
      return;
    }
    addTag(x + w / 2, y - 38, cue.prop === 'customer' ? '再梳一次' : '顺手全部上线', 0x2d7163);
    const g = this.add.graphics();
    g.fillStyle(0xfff0b8, 1).fillRoundedRect(x + 24, y + 10, w - 48, 42, 4);
    g.lineStyle(2, cue.prop === 'customer' ? 0x2d7163 : 0xe26b4d, 0.9)
      .strokeRoundedRect(x + 34, y + 20, w - 68, 20, 3);
    if (cue.prop === 'reversal') {
      g.lineStyle(3, 0xe26b4d, 0.9).lineBetween(x + 34, y + 40, x + w - 34, y + 18);
    }
    prop.add(g);
  }

  private drawHotspots(): void {
    HOTSPOTS.forEach((spot) => {
      const state = this.state();
      const target = STORY_BEATS[this.state().beat].target;
      const visible =
        hotspotVisible(spot, state) && hotspotSceneVisible(spot, state);
      if (!visible) return;
      const readClue = spot.kind === 'clue' && state.clues.includes(spot.clue || '');
      const isTarget =
        spot.id === target ||
        (target === 'finance' && spot.id === 'ledger') ||
        (target === 'boss' && spot.id === 'whiteboard') ||
        (target === 'customer' && spot.id === 'contract') ||
        (target === 'battle' && spot.id === 'briefing');
      const active =
        isTarget ||
        spot.kind === 'prep' ||
        (spot.kind === 'clue' && state.timeLeft > 0 && !readClue) ||
        (spot.id === 'desk' && state.beat === 'wake');
      const visualTarget = isTarget && spot.kind !== 'clue';
      const rect = this.add
        .rectangle(
          spot.x + spot.w / 2,
          spot.y + spot.h / 2,
          spot.w,
          spot.h,
          visualTarget ? 0xffdf86 : active ? 0x72e0c2 : 0x223c3d,
          visualTarget ? 0.13 : spot.kind === 'clue' ? 0.005 : active ? 0.045 : 0.01,
        )
        .setStrokeStyle(
          spot.kind === 'clue' ? 0 : 2,
          visualTarget ? 0xffdf86 : active ? 0x72e0c2 : 0xffffff,
          visualTarget ? 0.78 : active ? 0.34 : 0.08,
        )
        .setDepth(visualTarget ? 9 : 5);
      rect.setData('id', spot.id);
      rect
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => rect.setAlpha(1))
        .on('pointerout', () => rect.setAlpha(0.95))
        .on('pointerdown', () => {
          if (this.modal || this.state().mode !== 'map') return;
          this.approachHotspot(spot);
        });
      if (
        spot.kind === 'clue' &&
        !readClue &&
        state.timeLeft > 0
      ) {
        const badge = this.add.container(spot.x + spot.w - 32, spot.y + 10).setDepth(8);
        badge.add(
          this.add
            .rectangle(0, 0, 46, 22, 0x102b2e, 0.92)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x7be0c6, 0.72),
        );
        badge.add(
          this.add
            .text(0, 0, '资料', textStyle(10, '#d7fff5', '950'))
            .setOrigin(0.5),
        );
        this.tweens.add({
          targets: badge,
          y: badge.y - 3,
          yoyo: true,
          repeat: -1,
          duration: 900,
        });
      }
      if (isTarget && spot.kind === 'prep') {
        this.add
          .text(
            spot.x + spot.w - 6,
            spot.y + 6,
            `${state.preps.length}/3 已练`,
            textStyle(10, '#11332f', '900', '#7be0c6'),
          )
          .setOrigin(1, 0)
          .setDepth(7);
      }
    });
  }

  private drawActors(): void {
    const beat = this.state().beat;
    const mobile = this.isPortrait();
    ACTORS.filter((actor) => actor.beat === beat).forEach((actor) => {
      const c = this.add.container(actor.x, actor.y).setDepth(18);
      const shadow = this.add.ellipse(0, 24, 58, 16, 0x000000, 0.22);
      const texture = SPEAKERS[actor.id as SpeakerId]?.texture || `npc-${actor.id}`;
      const npc = this.add.sprite(0, -18, texture).setScale(0.42);
      const pulse = this.add
        .circle(0, -18, 48, actor.tint, 0.05)
        .setStrokeStyle(2, actor.tint, 0.34);
      this.tweens.add({
        targets: pulse,
        scaleX: 1.15,
        scaleY: 1.15,
        alpha: 0.02,
        yoyo: true,
        repeat: -1,
        duration: 820,
      });
      c.add([shadow, pulse, npc]);
      if (!mobile) {
        const name = this.add
          .text(0, 44, actor.name, textStyle(12, '#163331', '950', '#fff3d0'))
          .setOrigin(0.5);
        c.add(name);
      }
      c.setSize(86, 142)
        .setInteractive(
          new Phaser.Geom.Rectangle(-43, -118, 86, 154),
          Phaser.Geom.Rectangle.Contains,
        )
        .on('pointerover', () => {
          this.input.setDefaultCursor('pointer');
          c.setScale(1.04);
        })
        .on('pointerout', () => {
          this.input.setDefaultCursor('default');
          c.setScale(1);
        })
        .on('pointerdown', () => {
          if (this.modal || this.state().mode !== 'map') return;
          this.approachActor(actor);
        });
    });
  }

  private createPlayer(): void {
    const state = this.state();
    this.shadow = this.add
      .ellipse(state.player.x, state.player.y + 4, 34, 10, 0x000000, 0.24)
      .setDepth(16);
    this.player = this.physics.add
      .sprite(state.player.x, state.player.y, 'boWalk', IDLE_FRAME[state.direction])
      .setOrigin(0.5, 0.93)
      .setScale(0.48)
      .setDepth(20);
    this.player.body?.setSize(48, 28).setOffset(40, 126);
    this.player.setCollideWorldBounds(true);
    this.drawBoThought(state);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 36);
    this.cameras.main.setBounds(0, 0, GAME_W, WORLD_H);
  }

  private drawBoThought(state: PrologueState): void {
    if (this.isPortrait() || state.mode !== 'map') return;
    const line = boThoughtLine(state);
    const placement = boThoughtPlacement(state);
    const c = this.add.container(placement.x, placement.y).setDepth(24);
    c.add(
      this.add
        .rectangle(0, 0, 176, 38, 0x0b2224, 0.94)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(1, 0x7be0c6, 0.74),
    );
    c.add(
      this.add
        .triangle(placement.tailX, 22, -8, 0, 8, 0, 0, 12, 0x0b2224, 0.94)
        .setStrokeStyle(1, 0x7be0c6, 0.52),
    );
    const text = this.add
      .text(0, -12, wrapCjk(line, 12), textStyle(10, '#fff8dc', '900'))
      .setOrigin(0.5, 0)
      .setAlign('center')
      .setLineSpacing(2)
      .setWordWrapWidth(152);
    fitText(text, 152, 26, 10, 8);
    c.add(text);
    this.tweens.add({
      targets: c,
      y: c.y - 3,
      yoyo: true,
      repeat: -1,
      duration: 1060,
      ease: 'Sine.easeInOut',
    });
    this.boThought = c;
  }

  private drawHud(): void {
    const state = this.state();
    const story = STORY_BEATS[state.beat];
    const hud = this.add.container(0, 0).setDepth(80).setScrollFactor(0);
    const w = this.scale.width;
    const mobile = this.isPortrait();
    const topH = mobile ? 86 : 92;
    if (state.beat === 'wake') {
      this.drawWakeHud(hud, state, w);
      return;
    }
    hud.add(
      this.add.rectangle(0, 0, w, topH, 0x071719, 0.9).setOrigin(0, 0),
    );
    hud.add(
      this.add
        .text(16, 12, '袁博の极限售后', textStyle(mobile ? 22 : 24, '#ffe6a8', '950'))
        .setOrigin(0, 0),
    );
    hud.add(
      this.add
        .text(
          18,
          mobile ? 42 : 48,
          `序章 ${beatStep(state.beat)}/${BEAT_ORDER.length} · ${story.clock} ${story.place}`,
          textStyle(mobile ? 11 : 13, '#d8f4e8', '900'),
        )
        .setWordWrapWidth(mobile ? w - 134 : 330),
    );
    const metrics = mobile
      ? `行动 ${state.timeLeft}/${STARTING_TIME} · 资料 ${state.clues.length} · 遗留 ${state.debts.length}`
      : `行动 ${state.timeLeft}/${STARTING_TIME} · 资料 ${state.clues.length} · 准备 ${state.preps.length} · 遗留 ${state.debts.length} · 钱 ${state.metrics.cash}`;
    hud.add(
      this.add
        .text(
          mobile ? 18 : 18,
          mobile ? 62 : 64,
          metrics,
          textStyle(mobile ? 11 : 12, '#fff7d8', '900'),
        )
        .setWordWrapWidth(mobile ? w - 36 : 340),
    );
    this.drawHudStoryRail(hud, state, w);
    this.drawTargetGuide(hud, state, w, topH);
    this.drawHudCausalStrip(hud, state, w);
    const menu = makeButton(
      this,
      w - 104,
      14,
      88,
      38,
      '资料',
      () => this.showMenu(),
      0x28566a,
      12,
    );
    hud.add(menu);
    this.hint = this.add
      .text(
        w / 2,
        this.scale.height - (mobile ? 158 : 22),
        mobile ? '点地面或拖动摇杆移动，右下互动' : '点击地面或 WASD 移动，E/空格互动',
        textStyle(13, '#fff3d0', '900', '#13292c'),
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(90);
  }

  private drawWakeHud(
    hud: Phaser.GameObjects.Container,
    state: PrologueState,
    w: number,
  ): void {
    const mobile = this.isPortrait();
    const story = STORY_BEATS[state.beat];
    const topH = mobile ? 84 : 76;
    hud.add(
      this.add.rectangle(0, 0, w, topH, 0x071719, 0.92).setOrigin(0, 0),
    );
    hud.add(
      this.add
        .text(16, 12, '袁博の极限售后', textStyle(mobile ? 21 : 23, '#ffe6a8', '950'))
        .setOrigin(0, 0),
    );
    hud.add(
      this.add
        .text(
          18,
          mobile ? 43 : 46,
          `${story.clock} / ${story.place} · 三条未读同时弹出`,
          textStyle(mobile ? 11 : 13, '#d8f4e8', '900'),
        )
        .setWordWrapWidth(mobile ? w - 132 : 420),
    );
    this.hint = this.add
      .text(
        w / 2,
        this.scale.height - (mobile ? 158 : 22),
        mobile ? '点亮工位屏幕，然后点互动' : '点击工位或按 E，先选第一句话',
        textStyle(13, '#fff3d0', '900', '#13292c'),
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(90);
  }

  private drawTargetGuide(
    hud: Phaser.GameObjects.Container,
    state: PrologueState,
    w: number,
    topH: number,
  ): void {
    if (state.mode !== 'map') return;
    const mobile = this.isPortrait();
    const guideW = mobile ? w - 36 : 286;
    const guideH = mobile ? 34 : 38;
    const x = mobile ? 18 : w - guideW - 18;
    const y = mobile ? Math.max(topH + 96, this.scale.height - 334) : this.scale.height - 78;
    this.targetGuideBox = this.add
      .rectangle(x, y, guideW, guideH, 0x0b2224, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffdf86, 0.72);
    this.targetGuideText = this.add
      .text(x + 14, y + (mobile ? 8 : 9), '', textStyle(mobile ? 11 : 12, '#fff3d0', '950'))
      .setWordWrapWidth(guideW - 28)
      .setLineSpacing(2);
    hud.add([this.targetGuideBox, this.targetGuideText]);
    this.updateTargetGuide();
  }

  private drawHudStoryRail(
    hud: Phaser.GameObjects.Container,
    state: PrologueState,
    w: number,
  ): void {
    const mobile = this.isPortrait();
    if (mobile) return;
    const story = STORY_BEATS[state.beat];
    const x = 318;
    const y = 14;
    const cardW = Math.min(522, w - 438);
    const cardH = 58;
    const g = this.add.graphics();
    g.fillStyle(0x102b2e, 0.94).fillRoundedRect(x, y, cardW, cardH, 8);
    g.lineStyle(1, 0x7be0c6, 0.56).strokeRoundedRect(x, y, cardW, cardH, 8);
    hud.add(g);
    hud.add(
      this.add
        .text(
          x + 14,
          y + 9,
          `${story.clock} · ${story.place} · ${story.act}`,
          textStyle(12, '#ffe6a8', '950'),
        )
        .setWordWrapWidth(cardW - 28),
    );
    const current = this.add
      .text(
        x + 14,
        y + 30,
        `现在：${story.current}`,
        textStyle(11, '#e9f8df', '900'),
      )
      .setLineSpacing(2)
      .setWordWrapWidth(cardW - 28);
    fitText(current, cardW - 28, 16, 11, 9);
    hud.add(current);
    const next = this.add
      .text(
        x + 14,
        y + 45,
        `下一步：${story.next}`,
        textStyle(10, '#9ee8d1', '900'),
      )
      .setLineSpacing(2)
      .setWordWrapWidth(cardW - 28);
    fitText(next, cardW - 28, 12, 10, 8);
    hud.add(next);
    const dotX = 18;
    const dotY = 80;
    BEAT_ORDER.forEach((beat, index) => {
      const active = beat === state.beat;
      const done = beatStep(beat) < beatStep(state.beat);
      hud.add(
        this.add.circle(
          dotX + index * 14,
          dotY,
          active ? 4 : 3,
          active ? 0xffdf86 : done ? 0x7be0c6 : 0x38595a,
          1,
        ),
      );
    });
  }

  private drawHudCausalStrip(
    hud: Phaser.GameObjects.Container,
    state: PrologueState,
    w: number,
  ): void {
    if (this.isPortrait()) return;
    if (state.mode === 'map') return;
    if (state.beat === 'wake') return;
    const stripW = Math.min(520, w - 360);
    if (stripW < 320) return;
    const x = 18;
    const y = this.scale.height - 136;
    const line = storyCausalLine(state, true);
    const bg = this.add
      .rectangle(x, y, stripW, 48, 0x0b2224, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x7be0c6, 0.54);
    const label = this.add
      .text(x + 14, y + 7, '今日走势', textStyle(10, '#ffe6a8', '950'))
      .setWordWrapWidth(70);
    const body = this.add
      .text(x + 84, y + 7, wrapCjk(line, 38), textStyle(10, '#e9f8df', '900'))
      .setLineSpacing(3)
      .setWordWrapWidth(stripW - 98);
    fitText(body, stripW - 98, 34, 10, 8);
    hud.add([bg, label, body]);
  }

  private updatePlayer(delta: number): void {
    if (!this.player) return;
    const inputX =
      (this.keys?.A?.isDown || this.cursors?.left?.isDown ? -1 : 0) +
      (this.keys?.D?.isDown || this.cursors?.right?.isDown ? 1 : 0) +
      this.virtual.x;
    const inputY =
      (this.keys?.W?.isDown || this.cursors?.up?.isDown ? -1 : 0) +
      (this.keys?.S?.isDown || this.cursors?.down?.isDown ? 1 : 0) +
      this.virtual.y;
    const manual = new Phaser.Math.Vector2(inputX, inputY);
    const targetVelocity = new Phaser.Math.Vector2(0, 0);
    if (manual.lengthSq() > 0) {
      this.clearClickTarget();
      targetVelocity.copy(manual).normalize().scale(SPEED);
    } else if (this.clickTarget) {
      const toClick = new Phaser.Math.Vector2(
        this.clickTarget.x - this.player.x,
        this.clickTarget.y - this.player.y,
      );
      const distance = toClick.length();
      if (distance <= 10) {
        this.clearClickTarget(false);
      } else {
        targetVelocity.copy(toClick).normalize().scale(Math.min(SPEED, distance * 7));
      }
    }
    this.moveVector.lerp(targetVelocity, Math.min(0.42, Math.max(0.18, delta / 100)));
    if (targetVelocity.lengthSq() === 0 && this.moveVector.length() < 8)
      this.moveVector.set(0, 0);
    const state = this.state();
    if (this.moveVector.lengthSq() > 0) {
      if (Math.abs(this.moveVector.x) > Math.abs(this.moveVector.y))
        state.direction = this.moveVector.x < 0 ? 'left' : 'right';
      else state.direction = this.moveVector.y < 0 ? 'up' : 'down';
      this.player.anims.play(`bo-walk-${state.direction}`, true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(IDLE_FRAME[state.direction]);
    }
    this.player.setVelocity(this.moveVector.x, this.moveVector.y);
    state.player = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    };
    this.shadow?.setPosition(this.player.x, this.player.y + 4);
    if (this.boThought) {
      const placement = boThoughtPlacement(state);
      this.boThought.setPosition(placement.x, placement.y);
    }
    this.shared.setState(state);
    this.updateTargetGuide();
  }

  private setClickTarget(pointer: Phaser.Input.Pointer): void {
    if (this.state().mode !== 'map' || this.modal || !this.player) return;
    const topHud = this.isPortrait() ? 110 : 116;
    if (pointer.y <= topHud) return;
    if (this.isPortrait() && pointer.y >= this.scale.height - 184) return;
    const x = clamp(pointer.worldX, 58, GAME_W - 58);
    const y = clamp(pointer.worldY, 118, WORLD_H - 42);
    this.setWalkTarget(x, y);
  }

  private setWalkTarget(
    x: number,
    y: number,
    pending?: { id: string; kind: 'actor' | 'hotspot' },
  ): void {
    this.pendingInteraction = pending;
    this.clickTarget = new Phaser.Math.Vector2(x, y);
    this.clickMarker?.destroy();
    this.clickMarker = this.add
      .circle(x, y, 13, 0x7be0c6, 0.18)
      .setStrokeStyle(2, 0xffdf86, 0.85)
      .setDepth(15);
    this.tweens.add({
      targets: this.clickMarker,
      scaleX: 1.55,
      scaleY: 1.55,
      alpha: 0.04,
      duration: 520,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.clickMarker?.destroy();
        this.clickMarker = undefined;
      },
    });
  }

  private clearClickTarget(clearPending = true): void {
    this.clickTarget = undefined;
    if (clearPending) this.pendingInteraction = undefined;
    this.clickMarker?.destroy();
    this.clickMarker = undefined;
  }

  private approachActor(actor: ActorDefinition): void {
    if (!this.player) return;
    if (this.actorDistance(actor) <= 72) {
      this.clearClickTarget();
      this.talkToActor(actor);
      return;
    }
    const point = this.actorApproachPoint(actor);
    this.setWalkTarget(point.x, point.y, { id: actor.id, kind: 'actor' });
  }

  private approachHotspot(spot: HotspotDefinition): void {
    if (!this.player) return;
    if (this.hotspotDistance(spot) <= 42) {
      this.clearClickTarget();
      this.useHotspot(spot);
      return;
    }
    const point = this.hotspotApproachPoint(spot);
    this.setWalkTarget(point.x, point.y, { id: spot.id, kind: 'hotspot' });
  }

  private tryPendingInteraction(): void {
    if (!this.pendingInteraction || this.modal || !this.player || this.state().mode !== 'map')
      return;
    const pending = this.pendingInteraction;
    if (pending.kind === 'actor') {
      const actor = ACTORS.find(
        (item) => item.id === pending.id && item.beat === this.state().beat,
      );
      if (!actor) {
        this.clearClickTarget();
        return;
      }
      if (this.actorDistance(actor) <= 72) {
        this.clearClickTarget();
        this.talkToActor(actor);
      }
      return;
    }
    const spot = HOTSPOTS.find((item) => item.id === pending.id);
    if (!spot || !hotspotVisible(spot, this.state())) {
      this.clearClickTarget();
      return;
    }
    if (this.hotspotDistance(spot) <= 42) {
      this.clearClickTarget();
      this.useHotspot(spot);
    }
  }

  private actorDistance(actor: ActorDefinition): number {
    if (!this.player) return Number.POSITIVE_INFINITY;
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, actor.x, actor.y);
  }

  private hotspotDistance(spot: HotspotDefinition): number {
    if (!this.player) return Number.POSITIVE_INFINITY;
    const dx = Math.max(spot.x - this.player.x, 0, this.player.x - (spot.x + spot.w));
    const dy = Math.max(spot.y - this.player.y, 0, this.player.y - (spot.y + spot.h));
    return Math.hypot(dx, dy);
  }

  private actorApproachPoint(actor: ActorDefinition): { x: number; y: number } {
    const offset = actorApproachOffset(actor.id);
    return { x: actor.x + offset.x, y: actor.y + offset.y };
  }

  private hotspotApproachPoint(spot: HotspotDefinition): { x: number; y: number } {
    return { x: spot.x + spot.w / 2, y: spot.y + spot.h + 16 };
  }

  private updateNearest(): void {
    if (!this.player || this.state().mode !== 'map') return;
    const candidates: InteractionTarget[] = [];
    ACTORS.filter((actor) => actor.beat === this.state().beat).forEach(
      (actor) => {
        candidates.push({
          id: actor.id,
          label: actor.name,
          distance: Phaser.Math.Distance.Between(
            this.player!.x,
            this.player!.y,
            actor.x,
            actor.y,
          ),
          actor,
        });
      },
    );
    HOTSPOTS.forEach((spot) => {
      if (!hotspotVisible(spot, this.state()) || !hotspotSceneVisible(spot, this.state()))
        return;
      const dx = Math.max(spot.x - this.player!.x, 0, this.player!.x - (spot.x + spot.w));
      const dy = Math.max(spot.y - this.player!.y, 0, this.player!.y - (spot.y + spot.h));
      const enabled =
        spot.kind === 'menu' ||
        spot.kind === 'clue' ||
        spot.kind === 'prep' ||
        (spot.id === 'desk' && this.state().beat === 'wake');
      if (!enabled) return;
      candidates.push({
        id: spot.id,
        label: spot.label,
        distance: Math.hypot(dx, dy),
        hotspot: spot,
      });
    });
    this.nearest = candidates
      .filter((item) => item.distance <= (item.actor ? 72 : 42))
      .sort((a, b) => a.distance - b.distance)[0];
    const pendingLabel = this.pendingInteractionLabel();
    const hintText = pendingLabel
      ? `走向：${pendingLabel}`
      : this.nearest
        ? this.isPortrait()
          ? `点互动：${this.nearest.label}`
          : `点击地面移动，按 E：${this.nearest.label}`
        : this.isPortrait()
          ? '点地面或拖动摇杆移动，走近后点互动'
          : '点击地面或 WASD 移动，E/空格互动';
    this.hint?.setText(hintText);
    this.updateTargetGuide();
  }

  private pendingInteractionLabel(): string {
    if (!this.pendingInteraction) return '';
    if (this.pendingInteraction.kind === 'actor') {
      const actor = ACTORS.find(
        (item) => item.id === this.pendingInteraction?.id && item.beat === this.state().beat,
      );
      return actor?.name || '';
    }
    const spot = HOTSPOTS.find((item) => item.id === this.pendingInteraction?.id);
    return spot?.label || '';
  }

  private updateTargetGuide(): void {
    if (!this.targetGuideText || !this.targetGuideBox) return;
    const guide = this.targetGuideSnapshot();
    if (!guide) {
      this.targetGuideText.setText('');
      this.targetGuideBox.setVisible(false);
      return;
    }
    this.targetGuideBox.setVisible(true);
    const ready = guide.distance <= guide.interactDistance;
    this.targetGuideBox.setStrokeStyle(1, ready ? 0x7be0c6 : 0xffdf86, ready ? 0.92 : 0.72);
    this.targetGuideText.setColor(ready ? '#d8fff0' : '#fff3d0');
    this.targetGuideText.setText(
      ready
        ? `目标：${guide.label} 已到达 · ${this.isPortrait() ? '点互动' : '按 E 互动'}`
        : `目标：${guide.label} ${guide.arrow} ${guide.distance}步 · ${guide.action}`,
    );
  }

  private targetGuideSnapshot():
    | {
        id: string;
        label: string;
        action: string;
        arrow: string;
        distance: number;
        interactDistance: number;
        x: number;
        y: number;
      }
    | null {
    const state = this.state();
    if (state.mode !== 'map') return null;
    const target = currentGuideTarget(state);
    if (!target) return null;
    const player = this.player
      ? { x: this.player.x, y: this.player.y }
      : state.player;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distance = Math.max(0, Math.round(Math.hypot(dx, dy) / 10));
    const interactDistance = target.id === 'desk' ? 8 : target.id === 'briefing' ? 5 : 8;
    return {
      id: target.id,
      label: target.label,
      action: target.action,
      arrow: directionArrow(dx, dy),
      distance,
      interactDistance,
      x: Math.round(target.x),
      y: Math.round(target.y),
    };
  }

  private useHotspot(spot: HotspotDefinition): void {
    if (spot.kind === 'menu') {
      this.showMenu();
      return;
    }
    if (spot.kind === 'prep') {
      this.showPrepMenu();
      return;
    }
    if (spot.kind === 'desk') {
      this.showOpeningInboxBoard();
      return;
    }
    if (spot.kind === 'clue') this.collectClue(spot);
  }

  private showPrepMenu(): void {
    const state = this.state();
    const remaining = PREP_OPTIONS.filter((option) => !state.preps.includes(option.id));
    if (!remaining.length) {
      this.showDialog(
        '战前准备桌：今天能练的都练了',
        `博哥把收费说法、小范围试点演示和拉倒台阶都过了一遍。\n\n剩余行动：${state.timeLeft}/${STARTING_TIME}\n已准备：${prepSummary(state)}`,
        [{ label: '收起', action: () => this.closeModal(true) }],
        'system',
      );
      return;
    }
    if (state.timeLeft <= 0) {
      this.showDialog(
        '战前准备桌：时间用完',
        `今天只剩上桌谈判了。你已经把行动花在：${timeSpendSummary(state)}。\n\n这就是单日经营取舍：多查一张资料，就少练一次说法。`,
        [{ label: '收起', action: () => this.closeModal(true) }],
        'system',
      );
      return;
    }
    this.showPrepWorkbench(remaining);
  }

  private showPrepWorkbench(remaining: PrepOption[]): void {
    const state = this.state();
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '战前准备桌：台词彩排工作台';
    this.modalBody = '把收费、补一次、拉倒三条台词先练成能上桌的话。每练一次花 1 行动，终幕会少一块慌。';
    this.modalManagementHint = undefined;
    this.modalChoices = remaining.map((option) => ({
      label: option.label,
      detail: prepForecast(option).route,
      action: () => this.applyPrep(option),
    }));
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 840);
    const boxH = Math.min(h - 42, mobile ? 730 : 560);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xf7d66d, 0.9),
    );
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, y + 30, 112, 'system'));
    const textX = mobile ? x + 22 : x + 158;
    const textW = mobile ? boxW - 44 : boxW - 180;
    c.add(
      this.add
        .text(textX, y + 18, '台词彩排工作台', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
        .setWordWrapWidth(textW),
    );
    const intro = this.add
      .text(
        textX,
        y + (mobile ? 56 : 58),
        mobile
          ? wrapCjk('今天行动有限，练一条台词，就少查一张资料。', 22)
          : '今天行动有限，练一条台词，就少查一张资料。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(textW);
    fitText(intro, textW, mobile ? 40 : 30, mobile ? 11 : 12, 8);
    c.add(intro);
    this.drawPrepWorkbenchStatus(
      c,
      x + 22,
      y + (mobile ? 106 : 136),
      mobile ? boxW - 44 : 228,
      mobile ? 108 : boxH - 188,
      mobile,
    );
    this.drawPrepWorkbenchCards(
      c,
      mobile ? x + 22 : x + 272,
      y + (mobile ? 236 : 136),
      mobile ? boxW - 44 : boxW - 294,
      mobile ? boxH - 292 : boxH - 188,
      mobile,
    );
    const hint = this.add
      .text(
        x + 22,
        y + boxH - 36,
        `剩余行动 ${state.timeLeft}/${STARTING_TIME}。准备不是刷数值，是给终幕留一句能说出口的话。`,
        textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
      )
      .setWordWrapWidth(boxW - 44);
    fitText(hint, boxW - 44, 18, mobile ? 10 : 11, 8);
    c.add(hint);
    this.modal = c;
  }

  private drawPrepWorkbenchStatus(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const state = this.state();
    parent.add(
      this.add
        .rectangle(x, y, w, h, 0x0b2022, 0.98)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x7be0c6, 0.74),
    );
    parent.add(
      this.add
        .text(x + 14, y + 12, '今日取舍', textStyle(mobile ? 13 : 15, '#ffe6a8', '950'))
        .setWordWrapWidth(w - 28),
    );
    const lines = [
      `行动：${state.timeLeft}/${STARTING_TIME}`,
      `资料：${state.clues.length}`,
      `准备：${state.preps.length}`,
      `遗留：${state.debts.length ? state.debts.map(debtLabel).join('、') : '暂无'}`,
    ];
    const body = this.add
      .text(
        x + 14,
        y + (mobile ? 38 : 48),
        lines.join('\n'),
        textStyle(mobile ? 10 : 11, '#d7f3e9', '900'),
      )
      .setLineSpacing(5)
      .setWordWrapWidth(w - 28);
    fitText(body, w - 28, h - (mobile ? 48 : 58), mobile ? 10 : 11, 8);
    parent.add(body);
  }

  private drawPrepWorkbenchCards(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const state = this.state();
    const cards = prepWorkbenchCards(state).filter((card) => !card.prepared);
    const gap = mobile ? 8 : 10;
    const cardH = mobile ? (h - gap * 2) / 3 : (h - gap * 2) / 3;
    cards.forEach((cardData, index) => {
      const cy = y + index * (cardH + gap);
      const color = actionRouteColor(cardData.route);
      const card = this.add.container(x, cy).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, w, cardH, 0x0d2528, 0.99)
          .setOrigin(0, 0)
          .setStrokeStyle(2, color, 0.86),
      );
      card.add(this.add.rectangle(0, 0, 8, cardH, color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(18, 8, `${cardData.route} · ${cardData.label}`, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
          .setWordWrapWidth(w - 36),
      );
      const line = this.add
        .text(
          18,
          mobile ? 31 : 36,
          `博哥练：${mobile ? wrapCjk(cardData.line, 28) : shortPlainLine(cardData.line, 44)}`,
          textStyle(mobile ? 10 : 11, '#fff8dc', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(w - 36);
      fitText(line, w - 36, mobile ? 34 : 36, mobile ? 10 : 11, 8);
      card.add(line);
      const result = this.add
        .text(
          18,
          mobile ? 68 : 66,
          `${cardData.gain}\n代价：${cardData.risk}`,
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(w - 36);
      fitText(result, w - 36, cardH - (mobile ? 75 : 72), mobile ? 9 : 10, 7);
      card.add(result);
      card.setSize(w, cardH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, w, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.01));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.chooseDialog(index);
      });
      parent.add(card);
    });
  }

  private applyPrep(option: PrepOption): void {
    const state = this.state();
    const before = outcomeSnapshot(state);
    if (!this.spendTime(state, `准备：${option.label}`)) return;
    if (!state.preps.includes(option.id)) state.preps.push(option.id);
    this.applyMetricEffect(state, option.effect);
    option.clears?.forEach((id) => removeDebt(state, id));
    state.log.unshift(`战前准备：${option.label}。${option.line}`);
    this.setState(state);
    this.showChoiceOutcome(`prep:${option.id}`, before, state, () => this.redraw());
  }

  private collectClue(spot: HotspotDefinition): void {
    const state = this.state();
    const coreClue = spot.clue || spot.label;
    if (!state.clues.includes(coreClue) && state.timeLeft <= 0) {
      this.showDialog(
        `${spot.label}：今天没时间翻新资料`,
        `今天行动已经用完，不能再把新资料塞进谈判桌。\n\n已花行动：${timeSpendSummary(state)}\n\n可以继续推进剧情，但下午谈判会带着没查完的风险上桌。`,
        [{ label: '收起', action: () => this.closeModal(true) }],
        'system',
      );
      return;
    }
    if (spot.id === 'ledger' && !ledgerSortingComplete(state)) {
      this.showLedgerSortingBoard(spot);
      return;
    }
    this.ensureCoreClue(state, spot);
    const options = EVIDENCE_OPTIONS[spot.id] || [];
    const remaining = options.filter((option) => !state.clues.includes(option.label));
    this.setState(state);
    if (!remaining.length) {
      this.showDialog(
        `${spot.label}：资料已读完`,
        `这处材料已经拆完。\n\n当前资料：${options
          .map((option) => option.label)
          .join(' / ')}\n\n博哥现在不是靠嘴硬，是带着证据去收钱、补偿、拉倒。`,
        [{ label: '收起资料', action: () => this.closeModal(true) }],
        'system',
      );
      return;
    }
    this.showDialog(
      `${spot.label}：选择要抄进资料的卡`,
      `${this.clueIntro(spot)}\n\n经营选择不是全拿：剩余行动 ${state.timeLeft}/${STARTING_TIME}。每读 1 张资料卡花 1 行动；选哪张，会影响后面的预算、信任、耐心和边界。`,
      remaining.map((option) => ({
        label: option.label,
        detail: `花 1 行动 · ${option.detail}`,
        forecast: evidenceForecast(option),
        action: () => this.collectEvidence(spot, option),
      })),
      'system',
    );
  }

  private showLedgerSortingBoard(spot: HotspotDefinition): void {
    const state = this.state();
    const done = ledgerSortedIds(state);
    const remaining = LEDGER_SORT_ITEMS.filter((item) => !done.includes(item.id));
    if (!remaining.length) {
      this.completeLedgerSorting(spot);
      return;
    }
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '账单拆包：把截图贴到正确格子';
    this.modalBody = '把三张票据贴进对应格子，晚上客户问“咋收钱”时才有证据。';
    this.modalManagementHint = undefined;
    this.modalChoices = remaining.map((item) => ({
      label: `贴票据：${item.label}`,
      detail: item.target,
      action: () => this.applyLedgerSort(spot, item),
    }));

    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 760);
    const boxH = Math.min(h - 42, mobile ? 604 : 430);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdf86, 0.86),
    );
    c.add(
      this.add
        .text(x + 22, y + 18, '账单拆包：把截图贴到正确格子', textStyle(mobile ? 20 : 25, '#ffe6a8', '950'))
        .setWordWrapWidth(boxW - 44),
    );
    const intro = this.add
      .text(
        x + 22,
        y + (mobile ? 72 : 58),
        mobile
          ? wrapCjk('财务姐只问一句：这钱到底怎么收？把票据贴进格子，别再说云资源消耗。', 22)
          : '财务姐只问一句：这钱到底怎么收？把票据贴进格子，别再说“云资源消耗”。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(boxW - 44);
    fitText(intro, boxW - 44, mobile ? 48 : 28, mobile ? 11 : 12, 8);
    c.add(intro);

    this.drawLedgerSortSlots(c, x + 22, y + (mobile ? 130 : 104), boxW - 44, mobile ? 236 : 150, state, mobile);
    this.drawLedgerSortTickets(c, x + 22, y + (mobile ? 382 : 270), boxW - 44, mobile ? 128 : 82, spot, remaining, mobile);

    const footerY = y + boxH - (mobile ? 52 : 46);
    c.add(
      this.add
        .text(
          x + 22,
          footerY,
          `已贴 ${done.length}/3 · 剩余 ${remaining.map((item) => item.label).join('、')}`,
          textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
        )
        .setWordWrapWidth(boxW - 44),
    );
    this.modal = c;
  }

  private drawLedgerSortSlots(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    mobile: boolean,
  ): void {
    const slots = ledgerSortSlots(state);
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const slotW = mobile ? w : (w - gap * 2) / 3;
    const slotH = mobile ? (h - gap * 2) / 3 : h;
    slots.forEach((slot, index) => {
      const item = LEDGER_SORT_ITEMS.find((entry) => entry.id === slot.id)!;
      const sx = x + (index % cols) * (slotW + gap);
      const sy = y + Math.floor(index / cols) * (slotH + gap);
      parent.add(
        this.add
          .rectangle(sx, sy, slotW, slotH, slot.placed ? 0x17352d : 0x0b2022, 0.98)
          .setOrigin(0, 0)
          .setStrokeStyle(2, slot.placed ? item.color : 0x5ea99a, slot.placed ? 0.92 : 0.58),
      );
      parent.add(this.add.rectangle(sx, sy, 7, slotH, slot.placed ? item.color : 0x31535a, 0.92).setOrigin(0, 0));
      parent.add(
        this.add
          .text(sx + 16, sy + 10, slot.target, textStyle(mobile ? 12 : 13, '#ffe6a8', '950'))
          .setWordWrapWidth(slotW - 32),
      );
      const content = slot.placed
        ? `${item.label}\n${wrapCjk(item.line, mobile ? 18 : 14)}`
        : `${slot.label}\n等一张能解释的钱`;
      const body = this.add
        .text(sx + 16, sy + (mobile ? 34 : 42), content, textStyle(mobile ? 10 : 11, slot.placed ? '#d7fff5' : '#9ee8d1', '850'))
        .setLineSpacing(3)
        .setWordWrapWidth(slotW - 32);
      fitText(body, slotW - 32, slotH - (mobile ? 42 : 54), mobile ? 10 : 11, 8);
      parent.add(body);
    });
  }

  private drawLedgerSortTickets(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    spot: HotspotDefinition,
    remaining: LedgerSortItem[],
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : remaining.length;
    const ticketW = mobile ? w : (w - gap * (remaining.length - 1)) / Math.max(1, remaining.length);
    const ticketH = mobile ? Math.min(38, (h - gap * (remaining.length - 1)) / Math.max(1, remaining.length)) : h;
    remaining.forEach((item, index) => {
      const tx = x + (index % cols) * (ticketW + gap);
      const ty = y + Math.floor(index / cols) * (ticketH + gap);
      const card = this.add.container(tx, ty).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, ticketW, ticketH, 0xfff0b8, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(2, item.color, 0.88),
      );
      card.add(this.add.rectangle(0, 0, 7, ticketH, item.color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(16, mobile ? 5 : 8, item.label, textStyle(mobile ? 10 : 12, '#173331', '950'))
          .setWordWrapWidth(mobile ? 76 : ticketW - 28),
      );
      const source = this.add
        .text(
          mobile ? 98 : 16,
          mobile ? 5 : 32,
          mobile ? `${item.source} -> ${item.target}` : `${wrapCjk(item.source, 15)}\n贴到：${item.target}`,
          textStyle(mobile ? 9 : 10, '#3d3324', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(ticketW - (mobile ? 112 : 32));
      fitText(source, ticketW - (mobile ? 112 : 32), ticketH - (mobile ? 10 : 38), mobile ? 9 : 10, 7);
      card.add(source);
      card.setSize(ticketW, ticketH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, ticketW, ticketH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.012));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.applyLedgerSort(spot, item);
      });
      parent.add(card);
    });
  }

  private applyLedgerSort(
    spot: HotspotDefinition,
    item: LedgerSortItem,
  ): void {
    const state = this.state();
    const key = ledgerSortDecision(item.id);
    if (!state.decisions.includes(key)) state.decisions.push(key);
    state.log.unshift(`账单拆包：${item.label} 贴到 ${item.target}。${item.line}`);
    this.setState(state);
    if (ledgerSortingComplete(state)) {
      this.completeLedgerSorting(spot);
      return;
    }
    this.showLedgerSortingBoard(spot);
  }

  private completeLedgerSorting(spot: HotspotDefinition): void {
    const state = this.state();
    const before = outcomeSnapshot(state);
    this.ensureCoreClue(state, spot);
    if (!state.clues.includes('GPU 峰值曲线')) state.clues.push('GPU 峰值曲线');
    if (state.timeLeft > 0 && !state.timeLog.includes('查资料：账单拆包')) {
      this.spendTime(state, '查资料：账单拆包');
    }
    state.metrics.cash = clamp(state.metrics.cash + 55, 0, 9999);
    state.metrics.boundary = clamp(state.metrics.boundary + 4, 0, 100);
    state.metrics.pressure = clamp(state.metrics.pressure - 4, 0, 100);
    removeDebt(state, 'pricing-limbo');
    state.log.unshift(
      '账单拆包完成：GPU 峰值、试用额度、免费上限被拆成能收费的三格。',
    );
    this.setState(state);
    this.showChoiceOutcome('ledger:sort', before, state, () => this.redraw());
  }

  private ensureCoreClue(state: PrologueState, spot: HotspotDefinition): void {
    const clue = spot.clue || spot.label;
    if (state.clues.includes(clue)) return;
    state.clues.push(clue);
    if (clue === '成本三列表') {
      state.metrics.cash += 30;
      state.metrics.pressure = clamp(state.metrics.pressure - 2, 0, 100);
    }
    if (clue === '验收三句话') {
      state.metrics.trust = clamp(state.metrics.trust + 4, 0, 100);
      state.metrics.boundary = clamp(state.metrics.boundary + 4, 0, 100);
    }
    if (clue === '范围单模板') {
      state.metrics.boundary = clamp(state.metrics.boundary + 6, 0, 100);
    }
    state.log.unshift(`核心线索：${clue} 已进资料。`);
  }

  private collectEvidence(
    spot: HotspotDefinition,
    option: EvidenceOption,
  ): void {
    const state = this.state();
    this.ensureCoreClue(state, spot);
    if (!state.clues.includes(option.label)) {
      if (!this.spendTime(state, `查资料：${option.label}`)) {
        this.showDialog(
          '资料行动用完',
          `今天没有行动再翻新卡了。\n\n已花行动：${timeSpendSummary(state)}\n\n可以继续推进剧情，但下午谈判会带着没查完的风险上桌。`,
          [{ label: '收起', action: () => this.closeModal(true) }],
          'system',
        );
        return;
      }
      state.clues.push(option.label);
      this.applyMetricEffect(state, option.effect);
      state.log.unshift(`资料卡：${option.label}。${option.line}`);
    }
    this.setState(state);
    this.showDialog(
      option.label,
      `${option.line}\n\n数值变化：${option.detail}\n剩余行动：${state.timeLeft}/${STARTING_TIME}\n\n这张卡会在后面的财务追问、老板彩排和客户反悔里变成说法弹药。`,
      [
        { label: '收起资料', action: () => this.closeModal(true) },
        {
          label: '继续翻资料',
          action: () => {
            this.closeModal();
            this.collectClue(spot);
          },
        },
      ],
      'system',
    );
  }

  private applyMetricEffect(
    state: PrologueState,
    effect: Partial<Metrics>,
  ): void {
    Object.entries(effect).forEach(([key, amount]) => {
      const metric = key as keyof Metrics;
      const max = metric === 'cash' ? 9999 : 100;
      state.metrics[metric] = clamp(
        state.metrics[metric] + Math.floor(Number(amount) || 0),
        0,
        max,
      );
    });
  }

  private spendTime(state: PrologueState, label: string): boolean {
    if (state.timeLeft <= 0) return false;
    state.timeLeft -= 1;
    state.timeLog.push(label);
    state.metrics.pressure = clamp(state.metrics.pressure + 1, 0, 100);
    state.log.unshift(`时间片 -1：${label}。剩余 ${state.timeLeft}/${STARTING_TIME}。`);
    return true;
  }

  private clueIntro(spot: HotspotDefinition): string {
    if (spot.id === 'ledger')
      return '基础资源、加急服务、免费补偿被拆成几张卡。博哥终于能回答“这姐咋收钱”。';
    if (spot.id === 'whiteboard')
      return '白板上不是口号，是下午能不能把小范围试点、上线、验收拆开的台词。';
    return '打印机吐出范围单模板：能做、不能做、加钱做。字不多，但救命。';
  }

  private talkToActor(actor: ActorDefinition): void {
    const beat = this.state().beat;
    if (actor.id === 'finance' && beat === 'finance') this.financeScene();
    else if (actor.id === 'finance' && beat === 'financeAudit')
      this.financeAuditScene();
    else if (actor.id === 'boss' && beat === 'boss') this.bossScene();
    else if (actor.id === 'boss' && beat === 'bossRehearsal')
      this.bossRehearsalScene();
    else if (actor.id === 'customer' && beat === 'customer')
      this.customerScene();
    else if (actor.id === 'customer' && beat === 'customerReversal')
      this.customerReversalScene();
  }

  private financeScene(): void {
    this.showDialog(
      '财务姐：GPU 账单爆炸',
      '财务姐把截图拍到桌上：昨晚试用客户跑了三轮大模型，今天问“怎么还要钱”。博哥需要把“云资源”翻译成“收费项目”。',
      [
        {
          label: '拆成基础包/加急包',
          detail: '钱 +90，边界 +6',
          forecast: {
            route: '报价',
            gain: '钱有入口，后面更容易收基础服务费。',
            risk: '客户会觉得空气变硬，信任小降。',
          },
          action: () =>
            this.applyStoryChoice('finance:quote', 'financeAudit'),
        },
        {
          label: '先承认账单吓人',
          detail: '信任 +8，压力 -6',
          forecast: {
            route: '稳住',
            gain: '财务姐愿意听你解释，场面先降温。',
            risk: '价格没说清，晚点还会被追问。',
          },
          action: () =>
            this.applyStoryChoice('finance:empathy', 'financeAudit'),
        },
      ],
      'finance',
    );
  }

  private financeAuditScene(): void {
    const hasLedger = this.state().clues.includes('成本三列表');
    this.showDialog(
      '财务姐追问：谁批的预算',
      `财务姐没走，反而把截图放大：“我不是问你会不会讲人话，我问这钱谁认。”${hasLedger ? '博哥手里有成本三列表，至少不是没证据。' : '博哥还没看账单白板，嘴上越解释越像说不清。'}`,
      [
        {
          label: '把试用改成收费试点',
          detail: hasLedger ? '钱 +120，压力 -4' : '钱 +70，压力 +4',
          forecast: {
            route: '报价',
            gain: '试用从白送变成可收钱的小单。',
            risk: hasLedger ? '风险较低，证据能撑住。' : '没成本表支撑，后面还会被问。',
          },
          action: () =>
            this.applyStoryChoice('financeAudit:paid-pilot', 'boss'),
        },
        {
          label: '给一次免费额度有上限',
          detail: '信任 +8，边界 +6，钱 -40',
          forecast: {
            route: '补偿',
            gain: '客户有台阶，免费也写上限。',
            risk: '今天现金少一点，后面还要守住边界。',
          },
          action: () =>
            this.applyStoryChoice('financeAudit:free-cap', 'boss'),
        },
        {
          label: '先让博哥自己扛',
          detail: '压力 +14，耐心 -8',
          forecast: {
            route: '冒险',
            gain: '现场最快过去，不用立刻顶财务。',
            risk: '锅会带到晚上，谈判开局更难。',
          },
          action: () =>
            this.applyStoryChoice('financeAudit:self-bear', 'boss'),
        },
      ],
      'finance',
    );
  }

  private bossScene(): void {
    this.showBossLaunchBoard();
  }

  private showBossLaunchBoard(): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '老板上线拆板：今天上线怎么说';
    this.modalBody = '老板把“客户下午来、Agent 今天上线、话要能播”三件事丢上桌。先拆压力，再选博哥对老板的第一句。';
    this.modalManagementHint = undefined;
    this.modalChoices = BOSS_LAUNCH_ROUTES.map((route) => ({
      label: route.label,
      detail: route.route,
      action: () => this.applyStoryChoice(route.decision, 'bossRehearsal'),
    }));
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 820);
    const boxH = Math.min(h - 42, mobile ? 760 : 452);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x0d2430, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x5ca7ff, 0.88),
    );
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, y + 28, 112, 'boss'));
    const textX = mobile ? x + 22 : x + 156;
    const textW = mobile ? boxW - 44 : boxW - 178;
    c.add(
      this.add
        .text(textX, y + 18, '上线压力拆板', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
        .setWordWrapWidth(textW),
    );
    const intro = this.add
      .text(
        textX,
        y + (mobile ? 56 : 58),
        mobile
          ? wrapCjk('老板要今天上线，博哥要把话说成人能活下来的版本。', 22)
          : '老板要今天上线，博哥要把话说成人能活下来的版本。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(textW);
    fitText(intro, textW, mobile ? 44 : 30, mobile ? 11 : 12, 8);
    c.add(intro);
    this.drawBossLaunchPressures(
      c,
      x + 22,
      y + (mobile ? 104 : 126),
      boxW - 44,
      mobile ? 230 : 118,
      mobile,
    );
    this.drawBossLaunchRoutes(
      c,
      x + 22,
      y + (mobile ? 358 : 266),
      boxW - 44,
      mobile ? boxH - 408 : 126,
      mobile,
    );
    const hint = this.add
      .text(
        x + 22,
        y + boxH - 36,
        '老板：客户下午来，今天要能播。选一条上线说法，下一幕会拿它做彩排。',
        textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
      )
      .setWordWrapWidth(boxW - 44);
    fitText(hint, boxW - 44, 18, mobile ? 10 : 11, 8);
    c.add(hint);
    this.modal = c;
  }

  private drawBossLaunchPressures(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    BOSS_LAUNCH_PRESSURES.forEach((pressure, index) => {
      const px = x + (index % cols) * (cardW + gap);
      const py = y + Math.floor(index / cols) * (cardH + gap);
      parent.add(
        this.add
          .rectangle(px, py, cardW, cardH, 0x091d27, 0.98)
          .setOrigin(0, 0)
          .setStrokeStyle(2, pressure.color, 0.72),
      );
      parent.add(this.add.rectangle(px, py, 7, cardH, pressure.color, 0.92).setOrigin(0, 0));
      parent.add(
        this.add
          .text(px + 16, py + 8, pressure.label, textStyle(8, '#0d2430', '950', colorTextBg(pressure.color)))
          .setWordWrapWidth(cardW - 32),
      );
      parent.add(
        this.add
          .text(px + 16, py + (mobile ? 23 : 28), pressure.quote, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 32),
      );
      const line = this.add
        .text(
          px + 16,
          py + (mobile ? 45 : 58),
          mobile ? wrapCjk(pressure.pressure, 22) : wrapCjk(pressure.pressure, 15),
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 32);
      fitText(line, cardW - 32, cardH - (mobile ? 52 : 70), mobile ? 9 : 10, 7);
      parent.add(line);
      parent.add(
        this.add
          .text(
            px + cardW - 12,
            py + cardH - 20,
            `压到：${pressure.lane}`,
            textStyle(8, '#102526', '950', colorTextBg(pressure.color)),
          )
          .setOrigin(1, 0)
          .setWordWrapWidth(cardW - 24),
      );
    });
  }

  private drawBossLaunchRoutes(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    BOSS_LAUNCH_ROUTES.forEach((route, index) => {
      const rx = x + (index % cols) * (cardW + gap);
      const ry = y + Math.floor(index / cols) * (cardH + gap);
      const card = this.add.container(rx, ry).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x0b202b, 0.99)
          .setOrigin(0, 0)
          .setStrokeStyle(2, route.color, 0.86),
      );
      card.add(this.add.rectangle(0, 0, 8, cardH, route.color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(18, 8, `${route.route}：${route.label}`, textStyle(mobile ? 12 : 13, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 36),
      );
      const bo = this.add
        .text(
          18,
          mobile ? 30 : 34,
          `博哥：${mobile ? wrapCjk(route.boLine, 23) : route.boLine}`,
          textStyle(mobile ? 10 : 11, '#fff8dc', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 36);
      fitText(bo, cardW - 36, mobile ? 28 : 30, mobile ? 10 : 11, 8);
      card.add(bo);
      const result = this.add
        .text(
          18,
          mobile ? 58 : 70,
          `${route.gain}\n代价：${route.risk}`,
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(cardW - 36);
      fitText(result, cardW - 36, cardH - (mobile ? 65 : 76), mobile ? 9 : 10, 7);
      card.add(result);
      card.setSize(cardW, cardH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardW, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.01));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.chooseDialog(index);
      });
      parent.add(card);
    });
  }

  private bossRehearsalScene(): void {
    const hasWhiteboard = this.state().clues.includes('验收三句话');
    this.showDialog(
      '上线彩排：别把小范围试点吹成全部上线',
      `老板把大屏打开：“下午客户来，你给我一句能播出去的话。”${hasWhiteboard ? '验收白板已经写好三句话，博哥有台词。' : '白板还空着，任何承诺都会变成晚上追责。'}`,
      [
        {
          label: '演示“今天只上线试点”',
          detail: '信任 +8，压力 -6',
          forecast: {
            route: '稳住',
            gain: '客户听得懂，交付范围也还在。',
            risk: '不够强硬，报价还得后面补上。',
          },
          action: () =>
            this.applyStoryChoice('bossRehearsal:poc-script', 'customer'),
        },
        {
          label: '准备失败退路',
          detail: '边界 +10，耐心 -4',
          forecast: {
            route: '边界',
            gain: '失败时知道怎么退，不会硬扛到底。',
            risk: '说出来不够体面，耐心会掉一点。',
          },
          action: () =>
            this.applyStoryChoice('bossRehearsal:rollback', 'customer'),
        },
        {
          label: '老板要体面，话说满',
          detail: '钱 +80，压力 +16',
          forecast: {
            route: '冒险',
            gain: '场面漂亮，老板满意。',
            risk: '话越满，晚上越容易翻车。',
          },
          action: () =>
            this.applyStoryChoice('bossRehearsal:overpromise', 'customer'),
        },
      ],
      'boss',
    );
  }

  private customerScene(): void {
    this.showCustomerJokeBoard();
  }

  private showCustomerJokeBoard(): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '客户语音拆句：报价、补偿、拉倒';
    this.modalBody = '把客户姐那句玩笑拆成三股压力，再决定博哥第一句怎么回。';
    this.modalManagementHint = undefined;
    this.modalChoices = CUSTOMER_JOKE_ROUTES.map((route) => ({
      label: route.label,
      detail: route.route,
      action: () => this.applyStoryChoice(route.decision, 'customerReversal'),
    }));
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 800);
    const boxH = Math.min(h - 42, mobile ? 700 : 452);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x2d8f73, 0.88),
    );
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, y + 28, 112, 'customer'));
    const textX = mobile ? x + 22 : x + 156;
    const textW = mobile ? boxW - 44 : boxW - 178;
    c.add(
      this.add
        .text(textX, y + 18, '客户语音拆句', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
        .setWordWrapWidth(textW),
    );
    const intro = this.add
      .text(
        textX,
        y + (mobile ? 56 : 58),
        mobile
          ? wrapCjk('客户姐一句玩笑把收钱、补一次、拉倒全扔上桌。先拆句，再回话。', 22)
          : '客户姐一句玩笑把收钱、补一次、拉倒全扔上桌。先拆句，再回话。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(textW);
    fitText(intro, textW, mobile ? 44 : 30, mobile ? 11 : 12, 8);
    c.add(intro);
    this.drawCustomerJokeFragments(
      c,
      x + 22,
      y + (mobile ? 104 : 126),
      boxW - 44,
      mobile ? 172 : 118,
      mobile,
    );
    this.drawCustomerJokeRoutes(
      c,
      x + 22,
      y + (mobile ? 292 : 266),
      boxW - 44,
      mobile ? boxH - 342 : 126,
      mobile,
    );
    const hint = this.add
      .text(
        x + 22,
        y + boxH - 36,
        '客户姐：再给我梳一次。选一条先开口的路线，后面客户会反悔，终幕还要再谈。',
        textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
      )
      .setWordWrapWidth(boxW - 44);
    fitText(hint, boxW - 44, 18, mobile ? 10 : 11, 8);
    c.add(hint);
    this.modal = c;
  }

  private drawCustomerJokeFragments(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    CUSTOMER_JOKE_FRAGMENTS.forEach((fragment, index) => {
      const fx = x + (index % cols) * (cardW + gap);
      const fy = y + Math.floor(index / cols) * (cardH + gap);
      parent.add(
        this.add
          .rectangle(fx, fy, cardW, cardH, 0x0b2022, 0.98)
          .setOrigin(0, 0)
          .setStrokeStyle(2, fragment.color, 0.72),
      );
      parent.add(this.add.rectangle(fx, fy, 7, cardH, fragment.color, 0.92).setOrigin(0, 0));
      parent.add(
        this.add
          .text(fx + 16, fy + 9, fragment.quote, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 32),
      );
      const pressure = this.add
        .text(
          fx + 16,
          fy + (mobile ? 31 : 40),
          mobile ? wrapCjk(fragment.pressure, 20) : wrapCjk(fragment.pressure, 15),
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 32);
      fitText(pressure, cardW - 32, cardH - (mobile ? 38 : 54), mobile ? 9 : 10, 7);
      parent.add(pressure);
      parent.add(
        this.add
          .text(
            fx + cardW - 12,
            fy + cardH - 20,
            `归到：${fragment.lane}`,
            textStyle(8, '#102526', '950', colorTextBg(fragment.color)),
          )
          .setOrigin(1, 0)
          .setWordWrapWidth(cardW - 24),
      );
    });
  }

  private drawCustomerJokeRoutes(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    CUSTOMER_JOKE_ROUTES.forEach((route, index) => {
      const rx = x + (index % cols) * (cardW + gap);
      const ry = y + Math.floor(index / cols) * (cardH + gap);
      const card = this.add.container(rx, ry).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x0d2528, 0.99)
          .setOrigin(0, 0)
          .setStrokeStyle(2, route.color, 0.86),
      );
      card.add(this.add.rectangle(0, 0, 8, cardH, route.color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(18, 9, `${route.route}：${route.label}`, textStyle(mobile ? 12 : 13, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 36),
      );
      const bo = this.add
        .text(
          18,
          mobile ? 31 : 34,
          `博哥：${mobile ? wrapCjk(route.boLine, 23) : route.boLine}`,
          textStyle(mobile ? 10 : 11, '#fff8dc', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 36);
      fitText(bo, cardW - 36, mobile ? 28 : 30, mobile ? 10 : 11, 8);
      card.add(bo);
      const result = this.add
        .text(
          18,
          mobile ? 61 : 72,
          `${route.gain}\n代价：${route.risk}`,
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(cardW - 36);
      fitText(result, cardW - 36, cardH - (mobile ? 68 : 78), mobile ? 9 : 10, 7);
      card.add(result);
      card.setSize(cardW, cardH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardW, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.01));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.chooseDialog(index);
      });
      parent.add(card);
    });
  }

  private customerReversalScene(): void {
    this.showCustomerReversalBoard();
  }

  private showCustomerReversalBoard(): void {
    const hasContract = this.state().clues.includes('范围单模板');
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '客户反悔拆板：免费、上线、拉倒';
    this.modalBody = '客户把“再梳一次”升级成免费、全部上线和拉倒威胁。先拆压力，再选上桌开局。';
    this.modalManagementHint = undefined;
    this.modalChoices = CUSTOMER_REVERSAL_ROUTES.map((route) => ({
      label: route.label,
      detail: route.route,
      action: () => this.chooseCustomerReversal(route.decision, route.opening),
    }));
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 830);
    const boxH = Math.min(h - 42, mobile ? 780 : 464);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x2d8f73, 0.9),
    );
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, y + 28, 112, 'customer'));
    const textX = mobile ? x + 22 : x + 156;
    const textW = mobile ? boxW - 44 : boxW - 178;
    c.add(
      this.add
        .text(textX, y + 18, '客户反悔拆板', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
        .setWordWrapWidth(textW),
    );
    const intro = this.add
      .text(
        textX,
        y + (mobile ? 56 : 58),
        mobile
          ? wrapCjk(hasContract ? '范围单在手，顺手两个字能拆开。' : '没有范围单，顺手两个字会把今天吃掉。', 22)
          : hasContract
            ? '范围单在手，顺手两个字能拆开。'
            : '没有范围单，顺手两个字会把今天吃掉。',
        textStyle(mobile ? 11 : 12, '#d7f3e9', '900'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(textW);
    fitText(intro, textW, mobile ? 44 : 30, mobile ? 11 : 12, 8);
    c.add(intro);
    this.drawCustomerReversalPressures(
      c,
      x + 22,
      y + (mobile ? 104 : 126),
      boxW - 44,
      mobile ? 246 : 118,
      mobile,
    );
    this.drawCustomerReversalRoutes(
      c,
      x + 22,
      y + (mobile ? 372 : 274),
      boxW - 44,
      mobile ? boxH - 422 : 132,
      mobile,
    );
    const hint = this.add
      .text(
        x + 22,
        y + boxH - 36,
        '客户姐：免费可以，全部上线也要。选一条开局，下一步直接上终幕谈判桌。',
        textStyle(mobile ? 10 : 11, '#fff0c6', '900'),
      )
      .setWordWrapWidth(boxW - 44);
    fitText(hint, boxW - 44, 18, mobile ? 10 : 11, 8);
    c.add(hint);
    this.modal = c;
  }

  private drawCustomerReversalPressures(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    CUSTOMER_REVERSAL_PRESSURES.forEach((pressure, index) => {
      const px = x + (index % cols) * (cardW + gap);
      const py = y + Math.floor(index / cols) * (cardH + gap);
      parent.add(
        this.add
          .rectangle(px, py, cardW, cardH, 0x0b2022, 0.98)
          .setOrigin(0, 0)
          .setStrokeStyle(2, pressure.color, 0.72),
      );
      parent.add(this.add.rectangle(px, py, 7, cardH, pressure.color, 0.92).setOrigin(0, 0));
      parent.add(
        this.add
          .text(px + 16, py + 8, pressure.label, textStyle(8, '#102526', '950', colorTextBg(pressure.color)))
          .setWordWrapWidth(cardW - 32),
      );
      parent.add(
        this.add
          .text(px + 16, py + (mobile ? 24 : 30), pressure.quote, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 32),
      );
      const line = this.add
        .text(
          px + 16,
          py + (mobile ? 47 : 60),
          mobile ? wrapCjk(pressure.pressure, 22) : wrapCjk(pressure.pressure, 15),
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 32);
      fitText(line, cardW - 32, cardH - (mobile ? 54 : 72), mobile ? 9 : 10, 7);
      parent.add(line);
      parent.add(
        this.add
          .text(
            px + cardW - 12,
            py + cardH - 20,
            `压到：${pressure.lane}`,
            textStyle(8, '#102526', '950', colorTextBg(pressure.color)),
          )
          .setOrigin(1, 0)
          .setWordWrapWidth(cardW - 24),
      );
    });
  }

  private drawCustomerReversalRoutes(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    mobile: boolean,
  ): void {
    const gap = mobile ? 8 : 10;
    const cols = mobile ? 1 : 3;
    const cardW = mobile ? w : (w - gap * 2) / 3;
    const cardH = mobile ? (h - gap * 2) / 3 : h;
    CUSTOMER_REVERSAL_ROUTES.forEach((route, index) => {
      const rx = x + (index % cols) * (cardW + gap);
      const ry = y + Math.floor(index / cols) * (cardH + gap);
      const card = this.add.container(rx, ry).setDepth(520);
      card.add(
        this.add
          .rectangle(0, 0, cardW, cardH, 0x0d2528, 0.99)
          .setOrigin(0, 0)
          .setStrokeStyle(2, route.color, 0.86),
      );
      card.add(this.add.rectangle(0, 0, 8, cardH, route.color, 0.96).setOrigin(0, 0));
      card.add(
        this.add
          .text(18, 8, `${route.route}：${route.label}`, textStyle(mobile ? 12 : 13, '#ffe6a8', '950'))
          .setWordWrapWidth(cardW - 36),
      );
      const bo = this.add
        .text(
          18,
          mobile ? 30 : 34,
          `博哥：${mobile ? wrapCjk(route.boLine, 24) : route.boLine}`,
          textStyle(mobile ? 10 : 11, '#fff8dc', '900'),
        )
        .setLineSpacing(3)
        .setWordWrapWidth(cardW - 36);
      fitText(bo, cardW - 36, mobile ? 30 : 32, mobile ? 10 : 11, 8);
      card.add(bo);
      const result = this.add
        .text(
          18,
          mobile ? 62 : 72,
          `${route.gain}\n代价：${route.risk}`,
          textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(cardW - 36);
      fitText(result, cardW - 36, cardH - (mobile ? 70 : 78), mobile ? 9 : 10, 7);
      card.add(result);
      card.setSize(cardW, cardH).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardW, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerover', () => card.setScale(1.01));
      card.on('pointerout', () => card.setScale(1));
      card.on('pointerdown', () => {
        this.tweens.add({ targets: card, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.chooseDialog(index);
      });
      parent.add(card);
    });
  }

  private chooseCustomerReversal(decision: string, opening: string): void {
    const state = this.state();
    const before = outcomeSnapshot(state);
    if (!state.decisions.includes(decision)) state.decisions.push(decision);
    if (decision === 'customerReversal:quote-table') {
      state.metrics.cash += 45;
      state.metrics.pressure = clamp(state.metrics.pressure + 3, 0, 100);
      removeDebt(state, 'pricing-limbo');
      state.log.unshift('客户反悔：博哥把报价表推上桌，先把免费全部上线拆成价格。');
    }
    if (decision === 'customerReversal:poc-only') {
      state.metrics.trust = clamp(state.metrics.trust + 8, 0, 100);
      state.metrics.boundary = clamp(state.metrics.boundary + 3, 0, 100);
      removeDebt(state, 'compensation-habit');
      removeDebt(state, 'full-launch');
      state.log.unshift('客户反悔：博哥同意补一次，但只补小范围试点，不补幻想。');
    }
    if (decision === 'customerReversal:walkaway-line') {
      state.metrics.boundary = clamp(state.metrics.boundary + 12, 0, 100);
      state.metrics.trust = clamp(state.metrics.trust - 4, 0, 100);
      removeDebt(state, 'compensation-habit');
      state.log.unshift('客户反悔：博哥把拉倒说成退场机制，难听但有用。');
    }
    if (needsBattleReadinessGate(state)) {
      this.showBattleReadinessGate(opening, { decision, before });
      return;
    }
    this.startBattle(opening, { decision, before });
  }

  private showBattleReadinessGate(
    opening: string,
    outcome: { decision: string; before: OutcomeSnapshot },
  ): void {
    const state = this.state();
    state.log.unshift('终幕提醒：博哥差点空手上桌，先被迫停一下。');
    this.setState(state);
    const summary = battleReadinessSummary(state);
    this.showDialog(
      '上桌前还缺东西',
      `客户已经把“再梳一次”抬成“顺手全部上线”。\n\n现在的问题不是能不能说话，是桌上有没有东西撑住这句话。\n\n${summary.missing.join('\n')}\n\n你可以强行上桌，但这会把谈判开局推到高风险。`,
      [
        {
          label: '先回去准备',
          detail: '默认推荐',
          action: () => this.closeModal(true),
        },
        {
          label: '强行上桌',
          detail: '高风险',
          action: () => {
            this.closeModal();
            const forced = this.state();
            addDebt(forced, 'overpromise');
            this.setState(forced);
            this.startBattle(opening, outcome);
          },
        },
      ],
      'bo',
    );
  }

  private applyStoryChoice(decision: string, nextBeat: Beat): void {
    const state = this.state();
    const before = outcomeSnapshot(state);
    if (!state.decisions.includes(decision)) state.decisions.push(decision);
    if (decision === 'opening:finance') {
      state.metrics.cash += 40;
      state.metrics.boundary = clamp(state.metrics.boundary + 3, 0, 100);
      state.metrics.trust = clamp(state.metrics.trust - 2, 0, 100);
      removeDebt(state, 'pricing-limbo');
      state.log.unshift('开场选择：博哥先回财务，钱不能糊，关系先硬一点。');
    }
    if (decision === 'opening:boss') {
      state.metrics.pressure = clamp(state.metrics.pressure - 4, 0, 100);
      state.metrics.boundary = clamp(state.metrics.boundary + 4, 0, 100);
      addDebt(state, 'budget-blame');
      state.log.unshift('开场选择：博哥先稳老板上线说法，但财务账单还在发烫。');
    }
    if (decision === 'opening:customer') {
      state.metrics.trust = clamp(state.metrics.trust + 6, 0, 100);
      state.metrics.patience = clamp(state.metrics.patience - 3, 0, 100);
      addDebt(state, 'pricing-limbo');
      state.log.unshift('开场选择：博哥先回客户，关系稳住了，价格却先悬着。');
    }
    if (decision === 'finance:quote') {
      state.metrics.cash += 90;
      state.metrics.boundary = clamp(state.metrics.boundary + 6, 0, 100);
      state.metrics.trust = clamp(state.metrics.trust - 2, 0, 100);
      removeDebt(state, 'pricing-limbo');
      state.log.unshift('财务线：账单被拆成基础包和加急包，钱有入口了。');
    }
    if (decision === 'finance:empathy') {
      state.metrics.trust = clamp(state.metrics.trust + 8, 0, 100);
      state.metrics.pressure = clamp(state.metrics.pressure - 6, 0, 100);
      addDebt(state, 'pricing-limbo');
      state.log.unshift('财务线：博哥先承认账单吓人，财务姐愿意给解释窗口。');
    }
    if (decision === 'financeAudit:paid-pilot') {
      const hasLedger = state.clues.includes('成本三列表');
      state.metrics.cash += hasLedger ? 120 : 70;
      state.metrics.pressure = clamp(
        state.metrics.pressure + (hasLedger ? -4 : 4),
        0,
        100,
      );
      state.metrics.boundary = clamp(state.metrics.boundary + 5, 0, 100);
      if (hasLedger) removeDebt(state, 'pricing-limbo');
      else addDebt(state, 'budget-blame');
      state.log.unshift(
        hasLedger
          ? '财务追问：收费试点写清，财务姐终于有东西能回老板。'
          : '财务追问：收费试点先喊出去，但没成本表支撑，后面还会被追。',
      );
    }
    if (decision === 'financeAudit:free-cap') {
      state.metrics.cash = Math.max(0, state.metrics.cash - 40);
      state.metrics.trust = clamp(state.metrics.trust + 8, 0, 100);
      state.metrics.boundary = clamp(state.metrics.boundary + 6, 0, 100);
      addDebt(state, 'free-cap');
      removeDebt(state, 'pricing-limbo');
      state.log.unshift('财务追问：免费额度有上限，客户有台阶，博哥也有止损线。');
    }
    if (decision === 'financeAudit:self-bear') {
      state.metrics.pressure = clamp(state.metrics.pressure + 14, 0, 100);
      state.metrics.patience = clamp(state.metrics.patience - 8, 0, 100);
      addDebt(state, 'budget-blame');
      state.log.unshift('财务追问：博哥先自己扛，账没消失，只是变成晚上的锅。');
    }
    if (decision === 'boss:scope') {
      state.metrics.boundary = clamp(state.metrics.boundary + 10, 0, 100);
      state.metrics.trust = clamp(state.metrics.trust + 4, 0, 100);
      state.log.unshift('老板线：验收说法先写白板，今晚少一口锅。');
    }
    if (decision === 'boss:poc') {
      state.metrics.trust = clamp(state.metrics.trust + 9, 0, 100);
      state.metrics.pressure = clamp(state.metrics.pressure - 5, 0, 100);
      removeDebt(state, 'full-launch');
      state.log.unshift('老板线：全部上线被改成小范围试点上线，客户说法有了台阶。');
    }
    if (decision === 'boss:hard') {
      state.metrics.cash += 60;
      state.metrics.pressure = clamp(state.metrics.pressure + 12, 0, 100);
      addDebt(state, 'full-launch');
      state.log.unshift('老板线：博哥硬接全部上线，上半场帅，晚上可能哭。');
    }
    if (decision === 'bossRehearsal:poc-script') {
      state.metrics.trust = clamp(state.metrics.trust + 8, 0, 100);
      state.metrics.pressure = clamp(state.metrics.pressure - 6, 0, 100);
      removeDebt(state, 'overpromise');
      state.log.unshift('上线彩排：小范围试点台词排出来了，客户听起来像承诺，实际有范围。');
    }
    if (decision === 'bossRehearsal:rollback') {
      state.metrics.boundary = clamp(state.metrics.boundary + 10, 0, 100);
      state.metrics.patience = clamp(state.metrics.patience - 4, 0, 100);
      removeDebt(state, 'full-launch');
      state.log.unshift('上线彩排：失败退路进桌面，博哥少一分虚，老板少一分慌。');
    }
    if (decision === 'bossRehearsal:overpromise') {
      state.metrics.cash += 80;
      state.metrics.pressure = clamp(state.metrics.pressure + 16, 0, 100);
      state.metrics.boundary = clamp(state.metrics.boundary - 6, 0, 100);
      addDebt(state, 'overpromise');
      addDebt(state, 'full-launch');
      state.log.unshift('上线彩排：话说满了，场面漂亮，但范围开始往外漏。');
    }
    if (decision === 'customer:quote') {
      state.metrics.cash += 35;
      state.metrics.pressure = clamp(state.metrics.pressure + 4, 0, 100);
      removeDebt(state, 'pricing-limbo');
      state.log.unshift('客户初见：博哥先报价，空气硬了一点，钱也终于有入口。');
    }
    if (decision === 'customer:compensate') {
      state.metrics.trust = clamp(state.metrics.trust + 7, 0, 100);
      state.metrics.patience = clamp(state.metrics.patience - 4, 0, 100);
      addDebt(state, 'compensation-habit');
      state.log.unshift('客户初见：博哥答应补一次，但先把“补”写小一点。');
    }
    if (decision === 'customer:walkaway') {
      state.metrics.boundary = clamp(state.metrics.boundary + 10, 0, 100);
      state.metrics.trust = clamp(state.metrics.trust - 5, 0, 100);
      addDebt(state, 'relationship-cold');
      state.log.unshift('客户初见：博哥先把拉倒放桌上，关系紧了，边界稳了。');
    }
    state.beat = nextBeat;
    addMilestoneForBeat(state, nextBeat);
    this.setState(state);
    this.showChoiceOutcome(decision, before, state, () => this.redraw());
  }

  private startBattle(
    opening: string,
    outcome?: { decision: string; before: OutcomeSnapshot },
  ): void {
    const state = this.state();
    if (!state.decisions.includes(opening)) state.decisions.push(opening);
    state.beat = 'battle';
    state.mode = 'battle';
    addMilestoneForBeat(state, 'battle');
    const clueBonus = state.clues.length * 3;
    const client: BattleClient = {
      anger: 42 + state.metrics.pressure / 4,
      budget: 42 + clueBonus,
      scope: 58 - Math.floor(state.metrics.boundary / 8),
      trust: 38 + Math.floor(state.metrics.trust / 5),
    };
    if (opening === 'customer:quote') {
      client.budget += 13;
      client.anger += 8;
      state.metrics.cash += 40;
    }
    if (opening === 'customer:compensate') {
      client.trust += 12;
      client.scope += 8;
    }
    if (opening === 'customer:walkaway') {
      client.scope -= 9;
      client.anger += 12;
      state.metrics.boundary = clamp(state.metrics.boundary + 8, 0, 100);
    }
    const debtImpact = battleDebtImpact(state.debts);
    client.anger += debtImpact.anger;
    client.budget += debtImpact.budget;
    client.scope += debtImpact.scope;
    client.trust += debtImpact.trust;
    if (state.preps.includes('pricing-rehearsal')) {
      client.budget += 8;
      client.trust += 3;
    }
    if (state.preps.includes('poc-demo')) {
      client.trust += 8;
      client.scope -= 6;
    }
    if (state.preps.includes('walkaway-script')) {
      client.scope -= 8;
      client.anger -= 4;
    }
    const openingPressure = storyPressureFor(state, 0, 'price');
    const openingClient = clampClient(client);
    openingClient.anger = Math.min(openingClient.anger, 88);
    openingClient.scope = Math.min(openingClient.scope, 88);
    openingClient.budget = Math.max(openingClient.budget, 28);
    openingClient.trust = Math.max(openingClient.trust, 20);
    state.battle = {
      round: 1,
      phase: 0,
      client: openingClient,
      used: {},
      intent: openingPressure.line,
      intentType: 'price',
      storyPressure: openingPressure,
      log: [
        `今日追问：${openingPressure.source}。${openingPressure.line}`,
        state.preps.length
          ? `战前准备带入：${state.preps.map(prepLabel).join('、')}。`
          : '没有额外战前准备：只能靠资料和临场发挥。',
        state.debts.length
          ? `遗留问题带入：${state.debts.map(debtLabel).join('、')}。`
          : '资料干净：今天没有明显遗留问题带进谈判。',
        '客户姐：上次不是说再给我梳一次吗？这次咋收钱？',
        '博哥：能梳，但先讲清楚哪些是服务，哪些是情分。',
      ],
    };
    this.setState(state);
    if (outcome)
      this.showChoiceOutcome(outcome.decision, outcome.before, state, () =>
        this.redraw(),
      );
    else this.redraw();
  }

  private showChoiceOutcome(
    decision: string,
    before: OutcomeSnapshot,
    after: PrologueState,
    continueAction: () => void,
  ): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = true;
    this.activeBridge = undefined;
    this.activePhaseBreak = undefined;
    const summary = after.log[0] || decisionLabel(decision);
    const nextAction =
      after.mode === 'battle'
        ? '进入收费谈判，把资料和遗留问题带上桌。'
        : STORY_BEATS[after.beat]?.goal || OBJECTIVE[after.beat];
    const vignette = decisionVignette(decision, summary);
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const chips = [
      ...metricDeltaParts(before.metrics, after.metrics),
      ...debtDeltaParts(before.debts, after.debts),
    ].slice(0, mobileChipLimit(mobile));
    const sceneChange = outcomeSceneChange(summary);
    const finalImpact = outcomeFinalImpact(before, after);
    this.activeOutcome = {
      title: vignette.title,
      decision: decisionLabel(decision),
      sceneChange,
      finalImpact,
      nextAction,
      chips: chips.length ? chips : ['暂无明显数值变化'],
    };
    const boxW = Math.min(w - 28, mobile ? 430 : 790);
    const boxH = Math.min(h - 42, mobile ? 548 : 430);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.66).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdf86, 0.86),
    );
    c.add(
      this.add
        .text(
          x + 22,
          y + 18,
          mobile ? wrapCjk(vignette.title, 13) : `现场反应：${vignette.title}`,
          textStyle(mobile ? 21 : 25, '#ffe6a8', '950'),
        )
        .setLineSpacing(4)
        .setWordWrapWidth(boxW - 44),
    );
    c.add(
      this.add
        .text(
          x + 24,
          y + (mobile ? 70 : 52),
          `刚才博哥说：${decisionLabel(decision)}`,
          textStyle(mobile ? 11 : 12, '#9ee8d1', '900'),
        )
        .setWordWrapWidth(boxW - 48),
    );

    const quoteX = mobile ? x + 22 : x + 158;
    const quoteW = mobile ? boxW - 44 : boxW - 316;
    const quoteY = y + (mobile ? 96 : 86);
    if (!mobile) {
      c.add(this.drawDialogSpeaker(x + 24, y + 86, 104, 'bo'));
      c.add(this.drawDialogSpeaker(x + boxW - 128, y + 86, 104, vignette.speaker));
    }
    this.drawOutcomeQuote(
      c,
      quoteX,
      quoteY,
      quoteW,
      mobile ? 66 : 76,
      '博哥',
      vignette.boLine,
      SPEAKERS.bo.color,
    );
    this.drawOutcomeQuote(
      c,
      quoteX,
      quoteY + (mobile ? 76 : 88),
      quoteW,
      mobile ? 70 : 76,
      `${SPEAKERS[vignette.speaker].name}反应`,
      vignette.replyLine,
      SPEAKERS[vignette.speaker].color,
    );

    this.drawOutcomeChips(
      c,
      x + 22,
      y + (mobile ? 252 : 252),
      boxW - 44,
      this.activeOutcome.chips,
      mobile,
    );

    const buttonY = y + boxH - 56;
    const nextY = y + (mobile ? 332 : 314);
    const nextH = Math.min(mobile ? 132 : 78, Math.max(70, buttonY - nextY - 12));
    c.add(
      this.add
        .rectangle(x + 22, nextY, boxW - 44, nextH, 0x0d2528, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x5ea99a, 0.62),
    );
    c.add(
      this.add
        .text(x + 36, nextY + 10, '桌上变化', textStyle(10, '#ffe6a8', '950'))
        .setWordWrapWidth(74),
    );
    const sceneText = this.add
      .text(
        x + 104,
        nextY + 10,
        mobile ? wrapCjk(sceneChange, 23) : sceneChange,
        textStyle(mobile ? 10 : 11, '#e9f8df', '850'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(boxW - 126);
    fitText(sceneText, boxW - 126, mobile ? 36 : 22, mobile ? 10 : 11, 8);
    c.add(sceneText);
    c.add(
      this.add
        .text(x + 36, nextY + (mobile ? 58 : 38), '晚上回响', textStyle(10, '#9ee8d1', '950'))
        .setWordWrapWidth(74),
    );
    const impactText = this.add
      .text(
        x + 104,
        nextY + (mobile ? 58 : 38),
        mobile ? wrapCjk(finalImpact, 23) : finalImpact,
        textStyle(mobile ? 10 : 11, '#f4f1d9', '850'),
      )
      .setLineSpacing(4)
      .setWordWrapWidth(boxW - 126);
    fitText(impactText, boxW - 126, mobile ? 36 : 22, mobile ? 10 : 11, 8);
    c.add(impactText);
    if (mobile) {
      c.add(
        this.add
          .text(x + 36, nextY + 104, `下一步：${wrapCjk(nextAction, 21)}`, textStyle(9, '#fff0c6', '900'))
          .setWordWrapWidth(boxW - 72),
      );
    }

    this.modalTitle = '现场反应';
    this.modalChoices = [
      {
        label: after.mode === 'battle' ? '继续：收费谈判' : `继续：${BEAT_LABEL[after.beat]}`,
        action: () => {
          this.closeModal();
          const bridge = bridgeForDecision(decision, after);
          if (bridge) this.showBeatBridge(bridge, continueAction);
          else continueAction();
        },
      },
    ];
    c.add(
      makeButton(
        this,
        x + 22,
        buttonY,
        boxW - 44,
        40,
        this.modalChoices[0].label,
        () => this.chooseDialog(0),
        0x28566a,
        mobile ? 12 : 13,
      ),
    );
    this.modal = c;
  }

  private showBeatBridge(bridge: BeatBridge, continueAction: () => void): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = true;
    this.activeBridge = bridge;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = '镜头转场';
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 760);
    const boxH = Math.min(h - 42, mobile ? 500 : 360);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(520).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.68).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, bridge.accent, 0.9),
    );
    c.add(
      this.add
        .text(x + 22, y + 18, '镜头转场', textStyle(11, '#9ee8d1', '950'))
        .setWordWrapWidth(boxW - 44),
    );
    c.add(
      this.add
        .text(
          x + 22,
          y + 40,
          mobile ? wrapCjk(bridge.title, 13) : bridge.title,
          textStyle(mobile ? 23 : 28, '#ffe6a8', '950'),
        )
        .setLineSpacing(4)
        .setWordWrapWidth(boxW - 44),
    );
    c.add(
      this.add
        .text(
          x + 22,
          y + (mobile ? 96 : 78),
          bridge.kicker,
          textStyle(11, '#d7f3e9', '900'),
        )
        .setWordWrapWidth(boxW - 44),
    );

    const portraitSize = mobile ? 84 : 116;
    const portraitY = y + (mobile ? 124 : 112);
    if (!mobile) c.add(this.drawDialogSpeaker(x + 22, portraitY, portraitSize, bridge.speaker));

    const panelX = mobile ? x + 22 : x + portraitSize + 54;
    const panelY = y + (mobile ? 126 : 116);
    const panelW = mobile ? boxW - 44 : boxW - portraitSize - 76;
    const panelH = boxH - (mobile ? 206 : 184);
    this.drawBridgeStoryboard(c, panelX, panelY, panelW, panelH, bridge, mobile);

    const buttonY = y + boxH - 58;
    this.modalChoices = [
      {
        label: `进入：${BEAT_LABEL[bridge.nextBeat]}`,
        action: () => {
          this.closeModal();
          continueAction();
        },
      },
    ];
    c.add(
      makeButton(
        this,
        x + 22,
        buttonY,
        boxW - 44,
        42,
        this.modalChoices[0].label,
        () => this.chooseDialog(0),
        bridge.accent,
        mobile ? 12 : 13,
      ),
    );
    this.modal = c;
  }

  private drawBridgeStoryboard(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    bridge: BeatBridge,
    mobile: boolean,
  ): void {
    const panels = bridgeStoryboardPanels(bridge, this.state());
    const gap = mobile ? 8 : 7;
    const cardH = (h - gap * (panels.length - 1)) / panels.length;
    panels.forEach((panel, index) => {
      const cy = y + index * (cardH + gap);
      parent.add(
        this.add
          .rectangle(x, cy, w, cardH, 0x0d2528, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(1, panel.color, 0.72),
      );
      parent.add(this.add.rectangle(x, cy, 6, cardH, panel.color, 0.92).setOrigin(0, 0));
      parent.add(
        this.add
          .text(x + 14, cy + 8, panel.label, textStyle(mobile ? 10 : 11, '#ffe6a8', '950'))
          .setWordWrapWidth(w - 28),
      );
      const body = this.add
        .text(
          x + 14,
          cy + (mobile ? 28 : 30),
          mobile ? wrapCjk(panel.line, 24) : panel.line,
          textStyle(mobile ? 11 : 12, '#f4f1d9', '850'),
        )
        .setLineSpacing(4)
        .setWordWrapWidth(w - 28);
      fitText(body, w - 28, cardH - (mobile ? 34 : 36), mobile ? 11 : 12, 8);
      parent.add(body);
    });
  }

  private drawOutcomeQuote(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    line: string,
    color: number,
  ): void {
    parent.add(
      this.add
        .rectangle(x, y, w, h, 0x0d2528, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(2, color, 0.72),
    );
    parent.add(
      this.add.text(x + 14, y + 8, label, textStyle(11, '#ffe6a8', '950')),
    );
    const body = this.add
      .text(x + 14, y + 28, wrapCjk(line, this.isPortrait() ? 21 : 36), textStyle(this.isPortrait() ? 11 : 12, '#f4f1d9', '850'))
      .setLineSpacing(4)
      .setWordWrapWidth(w - 28);
    fitText(body, w - 28, h - 34, this.isPortrait() ? 11 : 12, 9);
    parent.add(body);
  }

  private drawOutcomeChips(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    chips: string[],
    mobile: boolean,
  ): void {
    const cols = mobile ? 2 : Math.min(3, chips.length);
    const gap = 8;
    const chipW = (w - gap * (cols - 1)) / cols;
    chips.forEach((chip, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = x + col * (chipW + gap);
      const cy = y + row * 28;
      const badChip =
        chip.includes('新增') ||
        chip.includes('升温') ||
        chip.includes('变冷') ||
        chip.includes('被耗') ||
        chip.includes('让步') ||
        chip.includes('松了');
      const goodChip =
        chip.includes('清理') ||
        chip.includes('钱先有名') ||
        chip.includes('稳住') ||
        chip.includes('耐心回') ||
        chip.includes('清楚') ||
        chip.includes('降下来');
      parent.add(
        this.add
          .rectangle(cx, cy, chipW, 22, badChip ? 0x5c3f34 : 0x17373b, 0.98)
          .setOrigin(0, 0)
          .setStrokeStyle(1, goodChip && !badChip ? 0x7be0c6 : 0xffdf86, 0.68),
      );
      const text = this.add
        .text(cx + chipW / 2, cy + 5, chip, textStyle(10, '#fff8dc', '950'))
        .setOrigin(0.5, 0)
        .setAlign('center')
        .setWordWrapWidth(chipW - 8);
      fitText(text, chipW - 8, 15, 10, 8);
      parent.add(text);
    });
  }

  private drawBattle(): void {
    document.querySelector('.yrpg-touch-bridge')?.setAttribute('hidden', '');
    this.cameras.main.stopFollow();
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    const state = this.state();
    const battle = state.battle;
    if (!battle) {
      state.mode = 'map';
      state.beat = 'customer';
      this.setState(state);
      this.redraw();
      return;
    }
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    this.add.rectangle(0, 0, w, h, 0x071719, 1).setOrigin(0, 0);
    this.add
      .text(24, 18, '收费谈判：这姐咋收钱啊', textStyle(mobile ? 22 : 28, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 48);
    this.add
      .text(
        26,
        mobile ? 72 : 56,
        `${STORY_BEATS.battle.clock} ${STORY_BEATS.battle.place} · 第 ${battle.round}/9 回合 · ${battlePhaseLine(battle.phase)}`,
        textStyle(mobile ? 12 : 14, '#d6f5e8', '900'),
      )
      .setWordWrapWidth(w - 52);
    if (mobile) this.drawMobileBattle(state, battle);
    else this.drawDesktopBattle(state, battle);
  }

  private drawDesktopBattle(state: PrologueState, battle: BattleState): void {
    addBoPortrait(this, 42, 112, 178, 230, 'talk');
    this.drawCustomerPortrait(740, 130, 168, 196);
    this.drawBattleActionFx(212, 244, 740, 244, battle, false);
    this.drawNegotiationTableScene(248, 90, 488, 192, state, battle, false);
    this.drawBattleDuelFocus(250, 294, 486, 142, state, battle, false);
    this.drawBattleClosingGoals(740, 336, 168, 90, state, battle, false);
    this.drawSkillButtons(58, 440, 844, 84, state, battle);
  }

  private drawMobileBattle(state: PrologueState, battle: BattleState): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const cramped = h < 780;
    const side = 26;
    const goalsY = cramped ? 94 : 96;
    const portraitY = cramped ? 132 : 136;
    const portraitW = cramped ? 108 : 122;
    const portraitH = cramped ? 128 : 144;
    const customerW = cramped ? 104 : 118;
    const customerH = cramped ? 122 : 138;
    const tableY = cramped ? 266 : 284;
    const tableH = cramped ? 132 : 146;
    const skillPanelH = cramped ? 170 : 184;
    const skillY = h - skillPanelH - (cramped ? 28 : 34);
    const focusY = tableY + tableH + 10;
    const focusH = Math.max(54, Math.min(168, skillY - focusY - 10));

    this.drawBattleClosingGoals(side + 2, goalsY, w - side * 2 - 4, cramped ? 32 : 34, state, battle, true);
    addBoPortrait(this, side + 2, portraitY, portraitW, portraitH, 'talk');
    this.drawCustomerPortrait(w - side - customerW, portraitY + 2, customerW, customerH);
    this.drawBattleActionFx(side + portraitW + 6, portraitY + portraitH - 26, w - side - customerW, portraitY + customerH - 28, battle, true);
    this.drawNegotiationTableScene(side + 2, tableY, w - side * 2 - 4, tableH, state, battle, true);
    if (cramped) {
      this.drawMobileBattleCompactFocus(side + 2, focusY, w - side * 2 - 4, focusH, state, battle);
    } else {
      this.drawBattleDuelFocus(side + 2, focusY, w - side * 2 - 4, focusH, state, battle, true);
    }
    this.drawSkillButtons(side, skillY, w - side * 2, skillPanelH, state, battle);
  }

  private drawMobileBattleCompactFocus(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    battle: BattleState,
  ): void {
    const focus = battleDuelFocus(state, battle);
    const accent =
      battle.lastImpact?.phaseBreak
        ? 0xffdf86
        : battle.lastImpact?.countered
          ? 0x7be0c6
          : intentColor(battle.intentType);
    this.add
      .rectangle(x, y, w, h, 0x0d2528, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, accent, 0.82);
    this.add.rectangle(x, y, 7, h, accent, 0.92).setOrigin(0, 0);
    const title = this.add
      .text(
        x + 16,
        y + 7,
        `本回合：${focus.title}`,
        textStyle(10, '#ffe6a8', '950'),
      )
      .setWordWrapWidth(w - 32);
    fitText(title, w - 32, 13, 10, 8);
    const body = this.add
      .text(
        x + 16,
        y + 24,
        wrapCjk(`${focus.customerLine} / 推荐：${focus.recommended.join('、') || '先稳住'}`, 24),
        textStyle(9, '#f4f1d9', '850'),
      )
      .setLineSpacing(2)
      .setWordWrapWidth(w - 32);
    fitText(body, w - 32, h - 30, 9, 7);
  }

  private drawNegotiationTableScene(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    battle: BattleState,
    compact: boolean,
  ): void {
    const lines = negotiationTableLines(state, battle);
    const accent = battle.lastImpact?.phaseBreak
      ? 0xffdf86
      : battle.lastImpact?.countered
        ? 0x7be0c6
        : intentColor(battle.intentType);
    const g = this.add.graphics();
    g.fillStyle(0x0d2528, 0.98).fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, accent, 0.78).strokeRoundedRect(x, y, w, h, 8);
    g.fillStyle(0x6b4b35, 0.78).fillRoundedRect(
      x + (compact ? 14 : 32),
      y + h - (compact ? 50 : 58),
      w - (compact ? 28 : 64),
      compact ? 34 : 42,
      8,
    );
    g.fillStyle(0xffdf86, 0.15).fillEllipse(x + w / 2, y + h - (compact ? 34 : 40), w * 0.68, compact ? 16 : 20);

    this.add
      .text(x + 14, y + 9, '谈判桌', textStyle(compact ? 10 : 11, '#ffe6a8', '950'))
      .setWordWrapWidth(64);
    this.add
      .text(
        x + (compact ? 76 : 88),
        y + 8,
        `${battlePhaseLine(battle.phase)} · ${intentLabel(battle.intentType)}`,
        textStyle(compact ? 10 : 11, '#9ee8d1', '950'),
      )
      .setWordWrapWidth(w - (compact ? 90 : 102));
    this.drawBattleTableProps(
      x + (compact ? 12 : 18),
      y + (compact ? 25 : 30),
      w - (compact ? 24 : 36),
      state,
      compact,
    );

    if (compact && h <= 136) {
      this.drawMobileNegotiationBrief(
        x + 12,
        y + 58,
        w - 24,
        36,
        lines,
        battle,
      );
      this.drawNegotiationTokens(
        x + 18,
        y + h - 29,
        w - 36,
        state,
        battle,
        compact,
      );
      return;
    }

    this.drawTalkBubble(
      x + (compact ? 12 : 20),
      y + (compact ? 59 : 68),
      compact ? w - 24 : Math.floor(w * 0.48),
      compact ? 28 : 36,
      '客户姐',
      lines.customer,
      intentColor(battle.intentType),
      compact,
    );
    this.drawTalkBubble(
      compact ? x + 12 : x + w - Math.floor(w * 0.48) - 20,
      y + (compact ? 89 : 108),
      compact ? w - 24 : Math.floor(w * 0.48),
      compact ? 28 : 36,
      '博哥',
      lines.bo,
      0x2d83a5,
      compact,
    );
    this.drawNegotiationTokens(
      x + (compact ? 18 : 24),
      y + h - (compact ? 27 : 36),
      w - (compact ? 36 : 48),
      state,
      battle,
      compact,
    );
  }

  private drawMobileNegotiationBrief(
    x: number,
    y: number,
    w: number,
    h: number,
    lines: NegotiationTableLines,
    battle: BattleState,
  ): void {
    const color = intentColor(battle.intentType);
    this.add
      .rectangle(x, y, w, h, 0x102b2e, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(1, color, 0.78);
    this.add.rectangle(x, y, 5, h, color, 0.92).setOrigin(0, 0);
    this.add
      .text(x + 12, y + 6, '对话', textStyle(9, '#ffe6a8', '950'))
      .setWordWrapWidth(40);
    const body = this.add
      .text(
        x + 58,
        y + 6,
        wrapCjk(`${lines.customer} / ${lines.bo}`, 28),
        textStyle(9, '#f4f1d9', '850'),
      )
      .setLineSpacing(2)
      .setWordWrapWidth(w - 70);
    fitText(body, w - 70, h - 10, 9, 7);
  }

  private drawBattleTableProps(
    x: number,
    y: number,
    w: number,
    state: PrologueState,
    compact: boolean,
  ): void {
    const props = battleTableProps(state);
    const gap = compact ? 5 : 7;
    const propW = (w - gap * (props.length - 1)) / props.length;
    const propH = compact ? 29 : 34;
    props.forEach((prop, index) => {
      const px = x + index * (propW + gap);
      this.add
        .rectangle(px, y, propW, propH, 0x0b2022, 0.94)
        .setOrigin(0, 0)
        .setStrokeStyle(1, prop.color, 0.62);
      const label = this.add
        .text(
          px + propW / 2,
          y + (compact ? 2 : 3),
          prop.label,
          textStyle(compact ? 8 : 9, '#fff8dc', '950'),
        )
        .setOrigin(0.5, 0)
        .setWordWrapWidth(propW - 8)
        .setAlign('center');
      fitText(label, propW - 8, compact ? 9 : 10, compact ? 8 : 9, 7);
      const line = this.add
        .text(
          px + 5,
          y + (compact ? 14 : 16),
          wrapCjk(prop.line, compact ? 9 : 12),
          textStyle(compact ? 7 : 8, '#d6f5e8', '850'),
        )
        .setLineSpacing(1)
        .setWordWrapWidth(propW - 10)
        .setAlign('center');
      fitText(line, propW - 10, compact ? 11 : 13, compact ? 7 : 8, 6);
    });
  }

  private drawTalkBubble(
    x: number,
    y: number,
    w: number,
    h: number,
    speaker: string,
    line: string,
    color: number,
    compact: boolean,
  ): void {
    this.add
      .rectangle(x, y, w, h, 0x102b2e, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(1, color, 0.76);
    this.add
      .rectangle(x, y, 5, h, color, 0.92)
      .setOrigin(0, 0);
    this.add
      .text(x + 12, y + 6, speaker, textStyle(compact ? 9 : 10, '#ffe6a8', '950'))
      .setWordWrapWidth(compact ? 48 : 54);
    const body = this.add
      .text(
        x + (compact ? 62 : 74),
        y + 6,
        wrapCjk(line, compact ? 19 : 23),
        textStyle(compact ? 9 : 10, '#f4f1d9', '850'),
      )
      .setLineSpacing(3)
      .setWordWrapWidth(w - (compact ? 72 : 86));
    fitText(body, w - (compact ? 72 : 86), h - 10, compact ? 9 : 10, 8);
  }

  private drawNegotiationTokens(
    x: number,
    y: number,
    w: number,
    state: PrologueState,
    battle: BattleState,
    compact: boolean,
  ): void {
    const tokens = negotiationTokens(state, battle);
    const gap = compact ? 6 : 8;
    const tokenW = (w - gap * 2) / 3;
    tokens.forEach((token, index) => {
      const tx = x + index * (tokenW + gap);
      this.add
        .rectangle(tx, y, tokenW, compact ? 26 : 32, 0x0b2022, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, token.color, 0.72);
      this.add
        .circle(tx + 14, y + (compact ? 13 : 16), compact ? 6 : 8, token.color, 0.92)
        .setStrokeStyle(1, 0xfff3c0, 0.72);
      const text = this.add
        .text(
          tx + 28,
          y + (compact ? 4 : 6),
          `${token.label} ${token.value}`,
          textStyle(compact ? 9 : 10, '#fff8dc', '950'),
        )
        .setWordWrapWidth(tokenW - 34);
      fitText(text, tokenW - 34, compact ? 20 : 22, compact ? 9 : 10, 8);
    });
  }

  private drawBattleClosingGoals(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    battle: BattleState,
    compact: boolean,
  ): void {
    const goals = battleClosingGoals(state, battle);
    this.add
      .rectangle(x, y, w, h, 0x102b2e, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffdf86, 0.62);
    if (compact) {
      const gap = 5;
      const goalW = (w - gap * 2) / 3;
      goals.forEach((goal, index) => {
        const gx = x + index * (goalW + gap);
        this.add
          .rectangle(gx, y, goalW, h, goal.done ? 0x17352d : 0x0b2022, 0.97)
          .setOrigin(0, 0)
          .setStrokeStyle(1, goal.color, goal.done ? 0.92 : 0.62);
        this.add.rectangle(gx, y + h - 4, goalW * goal.progress, 4, goal.color, 0.95).setOrigin(0, 0);
        const label = this.add
          .text(gx + 6, y + 4, goal.label, textStyle(8, '#ffe6a8', '950'))
          .setWordWrapWidth(goalW - 12);
        const status = this.add
          .text(gx + 6, y + 18, goal.status, textStyle(8, '#d7fff5', '900'))
          .setWordWrapWidth(goalW - 12);
        fitText(label, goalW - 12, 10, 8, 7);
        fitText(status, goalW - 12, 10, 8, 7);
      });
      return;
    }

    this.add
      .text(x + 12, y + 7, '收桌目标', textStyle(10, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 24);
    goals.forEach((goal, index) => {
      const rowY = y + 26 + index * 20;
      this.add
        .rectangle(x + 12, rowY + 13, w - 24, 4, 0x071719, 0.92)
        .setOrigin(0, 0);
      this.add
        .rectangle(x + 12, rowY + 13, (w - 24) * goal.progress, 4, goal.color, 0.95)
        .setOrigin(0, 0);
      this.add
        .circle(x + 18, rowY + 6, 4, goal.color, goal.done ? 1 : 0.72)
        .setStrokeStyle(1, 0xfff3c0, 0.62);
      const title = this.add
        .text(
          x + 28,
          rowY,
          `${goal.label}：${goal.status}`,
          textStyle(8, goal.done ? '#d7fff5' : '#fff8dc', '950'),
        )
        .setWordWrapWidth(w - 40);
      fitText(title, w - 40, 10, 8, 7);
      const line = this.add
        .text(x + 28, rowY + 10, goal.line, textStyle(7, '#d7f3e9', '850'))
        .setWordWrapWidth(w - 40);
      fitText(line, w - 40, 8, 7, 6);
    });
  }

  private drawBattleDuelFocus(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    battle: BattleState,
    compact: boolean,
  ): void {
    const focus = battleDuelFocus(state, battle);
    const accent =
      battle.lastImpact?.phaseBreak
        ? 0xffdf86
        : battle.lastImpact?.countered
          ? 0x7be0c6
          : intentColor(battle.intentType);
    this.add
      .rectangle(x, y, w, h, 0x0d2528, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, accent, 0.82);
    this.add.rectangle(x, y, 7, h, accent, 0.92).setOrigin(0, 0);
    this.add
      .text(x + 16, y + 8, '本回合对峙', textStyle(compact ? 11 : 12, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 32);
    const title = this.add
      .text(
        x + (compact ? 98 : 112),
        y + 8,
        focus.title,
        textStyle(compact ? 11 : 12, '#9ee8d1', '950'),
      )
      .setWordWrapWidth(w - (compact ? 114 : 128));
    fitText(title, w - (compact ? 114 : 128), 18, compact ? 11 : 12, 9);

    const customerY = y + (compact ? 34 : 36);
    const customerH = compact ? 42 : 46;
    this.add
      .rectangle(x + 16, customerY, w - 32, customerH, 0x143332, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, intentColor(battle.intentType), 0.76);
    this.add
      .text(x + 28, customerY + 7, '客户压上来', textStyle(10, '#ffe6a8', '950'))
      .setWordWrapWidth(compact ? 76 : 82);
    const customer = this.add
      .text(
        x + (compact ? 104 : 118),
        customerY + 7,
        wrapCjk(focus.customerLine, compact ? 20 : 30),
        textStyle(compact ? 10 : 11, '#f4f1d9', '900'),
      )
      .setLineSpacing(3)
      .setWordWrapWidth(w - (compact ? 124 : 140));
    fitText(customer, w - (compact ? 124 : 140), customerH - 12, compact ? 10 : 11, 8);

    const boY = customerY + customerH + 8;
    const boH = compact ? 40 : 40;
    this.add
      .rectangle(x + 16, boY, w - 32, boH, 0x102b2e, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x2d83a5, 0.76);
    this.add
      .text(x + 28, boY + 7, '博哥先想', textStyle(10, '#9ee8d1', '950'))
      .setWordWrapWidth(compact ? 76 : 82);
    const bo = this.add
      .text(
        x + (compact ? 104 : 118),
        boY + 7,
        wrapCjk(focus.boHint, compact ? 20 : 30),
        textStyle(compact ? 10 : 11, '#fff8dc', '900'),
      )
      .setLineSpacing(3)
      .setWordWrapWidth(w - (compact ? 124 : 140));
    fitText(bo, w - (compact ? 124 : 140), boH - 12, compact ? 10 : 11, 8);

    const footerY = boY + boH + 8;
    const rec = focus.recommended.length
      ? `推荐：${focus.recommended.join(' / ')}`
      : '看清这一问再出牌';
    this.add
      .rectangle(x + 16, footerY, w - 32, compact ? 28 : 28, 0x071719, 0.76)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffdf86, 0.48);
    const footer = this.add
      .text(
        x + 28,
        footerY + 6,
        `${rec} · ${focus.tableLine}`,
        textStyle(compact ? 9 : 10, '#fff0c6', '900'),
      )
      .setWordWrapWidth(w - 56);
    fitText(footer, w - 56, compact ? 18 : 18, compact ? 9 : 10, 7);
  }

  private drawCustomerPortrait(x: number, y: number, w: number, h: number): void {
    const c = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, w, h, 0x17373b, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffdf86, 0.82);
    const npcScale = Math.min((w - 18) / 128, (h - 22) / 160);
    const npc = this.add
      .sprite(w / 2, h / 2 + 16, 'speaker-customer')
      .setScale(npcScale);
    const label = this.add
      .text(w / 2, 14, '客户姐', textStyle(13, '#fff8dc', '950'))
      .setOrigin(0.5, 0);
    c.add([bg, npc, label]);
  }

  private drawBattleActionFx(
    boX: number,
    boY: number,
    customerX: number,
    customerY: number,
    battle: BattleState,
    compact: boolean,
  ): void {
    const impact = battle.lastImpact;
    if (!impact) return;
    const color = skillFxColor(impact.fx);
    const midX = (boX + customerX) / 2;
    const midY = (boY + customerY) / 2 - (compact ? 22 : 30);
    const g = this.add.graphics();
    g.lineStyle(compact ? 4 : 5, color, 0.72);
    g.lineBetween(boX, boY, customerX, customerY);
    g.fillStyle(color, 0.88);
    g.fillTriangle(
      customerX,
      customerY,
      customerX - 14,
      customerY - 7,
      customerX - 14,
      customerY + 7,
    );
    g.fillStyle(color, 0.24);
    g.fillCircle(customerX, customerY, compact ? 24 : 32);
    g.fillCircle(boX, boY, compact ? 15 : 20);

    const tagW = compact ? 132 : 164;
    const tagH = compact ? 34 : 38;
    this.add
      .rectangle(midX, midY, tagW, tagH, 0x102b2e, 0.96)
      .setStrokeStyle(2, color, 0.86)
      .setAlpha(0.92);
    this.add
      .text(
        midX,
        midY - (compact ? 11 : 13),
        skillFxLine(impact.fx),
        textStyle(compact ? 10 : 12, '#fff8dc', '950'),
      )
      .setOrigin(0.5, 0)
      .setAlign('center')
      .setWordWrapWidth(tagW - 12)
      .setAlpha(0.96);
    this.add
      .text(
        customerX,
        customerY + (compact ? 28 : 38),
        impact.countered ? '说到点上' : '客户继续顶',
        textStyle(10, '#102526', '950', impact.countered ? '#7be0c6' : '#ffdf86'),
      )
      .setOrigin(0.5, 0)
      .setAlpha(0.96);
  }

  private drawSkillButtons(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    battle: BattleState,
  ): void {
    const mobile = this.isPortrait();
    const cols = mobile ? 2 : 5;
    const gap = mobile ? 10 : 8;
    const bw = (w - gap * (cols - 1)) / cols;
    const commands = battleCommandCards(state, battle);
    const rows = Math.ceil(commands.length / cols);
    const bh = mobile
      ? Math.max(48, Math.min(52, (h - gap * (rows - 1)) / rows))
      : h;
    commands.forEach((command, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      this.drawBattleCommandCard(
        x + col * (bw + gap),
        y + row * (bh + gap),
        bw,
        bh,
        command,
        mobile,
      );
    });
  }

  private drawBattleCommandCard(
    x: number,
    y: number,
    w: number,
    h: number,
    command: BattleCommand,
    mobile: boolean,
  ): void {
    const skill = BATTLE_SKILLS.find((item) => item.id === command.id)!;
    const accent = command.countered ? 0xffdf86 : skill.color;
    const c = this.add.container(x, y).setDepth(220);
    c.add(
      this.add
        .rectangle(0, 0, w, h, command.countered ? 0x17352d : 0x0d2528, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(command.countered ? 2 : 1, accent, command.countered ? 0.94 : 0.72),
    );
    c.add(this.add.rectangle(0, 0, mobile ? 6 : 8, h, accent, 0.95).setOrigin(0, 0));
    if (mobile) {
      c.add(
        this.add
          .text(
            12,
            5,
            command.countered ? `${command.label} · 推荐` : command.label,
            textStyle(9, '#102526', '950', colorTextBg(accent)),
          )
          .setWordWrapWidth(w - 24),
      );
      const speech = this.add
        .text(12, 24, command.speech, textStyle(9, '#fff8dc', '950'))
        .setLineSpacing(2)
        .setWordWrapWidth(w - 24);
      fitText(speech, w - 24, 16, 9, 8);
      c.add(speech);
      const tag = this.add
        .text(
          12,
          40,
          command.countered ? command.counter : command.risk,
          textStyle(8, command.countered ? '#ffe6a8' : '#f4f1d9', '850'),
        )
        .setWordWrapWidth(w - 24);
      fitText(tag, w - 24, 10, 8, 7);
      c.add(tag);
      c.setSize(w, h).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, w, h),
        Phaser.Geom.Rectangle.Contains,
      );
      c.on('pointerover', () => c.setScale(1.01));
      c.on('pointerout', () => c.setScale(1));
      c.on('pointerdown', () => {
        this.tweens.add({ targets: c, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
        this.useBattleSkill(command.id);
      });
      return;
    }
    c.add(
      this.add
        .text(
          14,
          7,
          command.label,
          textStyle(10, '#102526', '950', colorTextBg(accent)),
        )
        .setWordWrapWidth(72),
    );
    const speech = this.add
      .text(
        14,
        26,
        `博哥：${command.speech}`,
        textStyle(10, '#fff8dc', '950'),
      )
      .setLineSpacing(2)
      .setWordWrapWidth(w - 28);
    fitText(speech, w - 28, 18, 10, 8);
    c.add(speech);
    const counter = this.add
      .text(
        14,
        45,
        command.countered ? `克制：${command.counter}` : `风险：${command.risk}`,
        textStyle(9, command.countered ? '#ffe6a8' : '#f4f1d9', '850'),
      )
      .setWordWrapWidth(w - 28);
    fitText(counter, w - 28, 13, 9, 7);
    c.add(counter);
    const effect = this.add
      .text(
        14,
        58,
        command.effect,
        textStyle(9, '#9ee8d1', '850'),
      )
      .setWordWrapWidth(w - 28);
    fitText(effect, w - 28, 12, 9, 7);
    c.add(effect);
    c.setSize(w, h).setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    c.on('pointerover', () => c.setScale(1.01));
    c.on('pointerout', () => c.setScale(1));
    c.on('pointerdown', () => {
      this.tweens.add({ targets: c, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
      this.useBattleSkill(command.id);
    });
  }

  private useBattleSkill(id: SkillId): void {
    const state = this.state();
    const battle = state.battle;
    if (!battle || state.mode !== 'battle') return;
    const used = battle.used[id] || 0;
    const beforeClient = { ...battle.client };
    const beforeMetrics = { ...state.metrics };
    const beforeIntent = battle.intentType;
    const countered = battleCounterSkills(state, battle).includes(id);
    battle.used[id] = used + 1;
    battle.lastSkill = id;
    battle.lastFeedback = skillPreview(id, state, battle).reason;
    const c = battle.client;
    if (id === 'quote') {
      c.budget +=
        18 +
        (state.clues.includes('成本三列表') ? 6 : 0) +
        (state.preps.includes('pricing-rehearsal') ? 5 : 0);
      c.trust += 4;
      c.anger += used ? 10 : 7;
      state.metrics.patience -= 6;
      state.metrics.cash += 35;
      battle.log.unshift(
        `博哥：基础包、加急包、跟进包，免费只能在包里讲。${state.preps.includes('pricing-rehearsal') ? '收费说法演练生效，报价没有飘。' : ''}`,
      );
    }
    if (id === 'compensate') {
      c.trust += 18;
      c.anger -= 7;
      c.scope +=
        (used ? 12 : 8) - (state.preps.includes('poc-demo') ? 6 : 0);
      state.metrics.patience -= 10;
      battle.log.unshift(
        `博哥：我再给你梳一次，但这次叫小范围试点，不叫全部上线。${state.preps.includes('poc-demo') ? '演示退路把补偿锁在试点里。' : ''}`,
      );
    }
    if (id === 'boundary') {
      c.scope -= 20 + (state.clues.includes('范围单模板') ? 5 : 0);
      c.trust += state.clues.includes('验收三句话') ? 7 : 3;
      c.anger += 5;
      state.metrics.boundary += 6;
      state.metrics.patience -= 5;
      battle.log.unshift(
        `博哥：能做、不能做、加钱做，三列写清。${state.clues.includes('范围单模板') ? '范围单模板让范围收得更稳。' : ''}`,
      );
    }
    if (id === 'walkaway') {
      c.scope -= 13 + (state.preps.includes('walkaway-script') ? 6 : 0);
      c.budget += battle.phase >= 2 ? 10 : 2;
      c.trust -= battle.phase >= 2 ? 2 : 8;
      c.anger +=
        (battle.phase >= 2 ? 7 : 15) -
        (state.preps.includes('walkaway-script') ? 5 : 0);
      state.metrics.boundary += 12;
      state.metrics.pressure -= 4;
      battle.log.unshift(
        `博哥：不签范围就先拉倒，但证据和台阶都留着。${state.preps.includes('walkaway-script') ? '退场台词让“拉倒”不再像摔门。' : ''}`,
      );
    }
    if (id === 'breathe') {
      state.metrics.patience += 12;
      state.metrics.pressure -= 5;
      c.trust += 3;
      c.budget -= 2;
      battle.log.unshift('博哥喝水：嘴可以慢一点，账不能糊一点。');
    }
    if (countered) {
      battle.log.unshift(`说法对路：${skillLabel(id)} 压住了${intentLabel(battle.intentType)}。`);
    }
    state.metrics = clampMetrics(state.metrics);
    battle.client = clampClient(c);
    this.afterPlayerSkill(state, battle, {
      skill: id,
      beforeClient,
      beforeMetrics,
      beforeIntent,
      countered,
    });
  }

  private afterPlayerSkill(
    state: PrologueState,
    battle: BattleState,
    context: BattleImpactContext,
  ): void {
    const phase = PHASES[battle.phase];
    let completedPhase: number | null = null;
    let customerLine = '';
    if (phase?.pass(battle, state)) {
      completedPhase = battle.phase;
      battle.log.unshift(phase.line);
      customerLine = phase.line;
      battle.phase += 1;
      if (battle.phase >= PHASES.length) {
        battle.lastImpact = battleImpact(
          context,
          state,
          battle,
          '客户姐终于点头：钱、范围、退场机制都写清了。',
          true,
        );
        this.finishBattle(state, 'win');
        return;
      }
      const nextIntent = nextClientIntent(state, battle);
      battle.intent = nextIntent.text;
      battle.intentType = nextIntent.type;
      battle.storyPressure = nextIntent.pressure;
    } else {
      customerLine = this.clientTurn(state, battle);
    }
    battle.round += 1;
    if (
      state.metrics.patience <= 0 ||
      battle.client.anger >= 100 ||
      battle.client.scope >= 100 ||
      battle.client.budget <= 0
    ) {
      battle.lastImpact = battleImpact(
        context,
        state,
        battle,
        '客户压力打穿了桌面，谈判被免费售后留下的问题拖崩。',
        false,
      );
      this.finishBattle(state, 'fail');
      return;
    }
    if (battle.round > 9) {
      battle.lastImpact = battleImpact(
        context,
        state,
        battle,
        battle.phase >= 2 ? '局面没有全赢，但至少留住了小范围试点台阶。' : '回合耗尽，关键边界没有立住。',
        battle.phase >= 2,
      );
      this.finishBattle(state, battle.phase >= 2 ? 'partial' : 'fail');
      return;
    }
    battle.lastImpact = battleImpact(
      context,
      state,
      battle,
      customerLine || battle.intent,
      completedPhase !== null,
    );
    battle.log = battle.log.slice(0, 6);
    this.setState(state);
    if (completedPhase !== null) this.showBattlePhaseBreak(completedPhase, battle);
    else this.redraw();
  }

  private showBattlePhaseBreak(
    completedPhase: number,
    battle: BattleState,
  ): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modal = undefined;
    this.modalBlocking = true;
    const completed = PHASES[completedPhase];
    const next = PHASES[battle.phase];
    const story = phaseBreakStory(completedPhase);
    const nextGoal = phaseBreakNextGoal(battle.phase);
    const panels = phaseBreakPanels(completedPhase, battle, story, nextGoal);
    const chips = phaseBreakChips(battle);
    this.activePhaseBreak = {
      completedTitle: completed.title,
      story,
      nextTitle: next.title,
      nextGoal,
      nextPressure: battle.intent,
      panels,
      chips,
    };
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.modalTitle = '谈判阶段突破';
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const boxW = Math.min(w - 28, mobile ? 430 : 760);
    const boxH = Math.min(h - 42, mobile ? 460 : 430);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(540).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.68).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.99)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdf86, 0.86),
    );
    c.add(
      this.add
        .text(x + 22, y + 18, '谈判阶段突破', textStyle(11, '#9ee8d1', '950'))
        .setWordWrapWidth(boxW - 44),
    );
    c.add(
      this.add
        .text(
          x + 22,
          y + 42,
          mobile ? wrapCjk(`${completed.title} 过关`, 13) : `${completed.title} 过关`,
          textStyle(mobile ? 23 : 28, '#ffe6a8', '950'),
        )
        .setWordWrapWidth(boxW - 44),
    );
    const cardY = y + (mobile ? 96 : 92);
    const cardH = mobile ? 66 : 62;
    panels.forEach((panel, index) => {
      const cy = cardY + index * (cardH + 8);
      c.add(
        this.add
          .rectangle(x + 22, cy, boxW - 44, cardH, 0x0d2528, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(1, panel.color, 0.76),
      );
      c.add(this.add.rectangle(x + 22, cy, 6, cardH, panel.color, 0.92).setOrigin(0, 0));
      c.add(
        this.add
          .text(x + 36, cy + 8, panel.label, textStyle(10, '#ffe6a8', '950'))
          .setWordWrapWidth(86),
      );
      const line = this.add
        .text(
          x + (mobile ? 36 : 122),
          cy + (mobile ? 28 : 12),
          mobile ? wrapCjk(panel.line, 24) : panel.line,
          textStyle(mobile ? 11 : 12, '#f4f1d9', '850'),
        )
        .setLineSpacing(4)
        .setWordWrapWidth(mobile ? boxW - 72 : boxW - 150);
      fitText(line, mobile ? boxW - 72 : boxW - 150, cardH - (mobile ? 34 : 20), mobile ? 11 : 12, 8);
      c.add(line);
    });
    this.drawPhaseBreakChips(c, x + 22, cardY + 3 * (cardH + 8) + 4, boxW - 44, chips, mobile);
    const buttonY = y + boxH - 58;
    this.modalChoices = [
      {
        label: `进入：${next.title}`,
        action: () => {
          this.closeModal();
          this.redraw();
        },
      },
    ];
    c.add(
      makeButton(
        this,
        x + 22,
        buttonY,
        boxW - 44,
        42,
        this.modalChoices[0].label,
        () => this.chooseDialog(0),
        0x28566a,
        mobile ? 12 : 13,
      ),
    );
    this.modal = c;
  }

  private drawPhaseBreakChips(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    chips: string[],
    mobile: boolean,
  ): void {
    const cols = mobile ? 2 : 4;
    const gap = 8;
    const chipW = (w - gap * (cols - 1)) / cols;
    chips.slice(0, 4).forEach((chip, index) => {
      const cx = x + (index % cols) * (chipW + gap);
      const cy = y + Math.floor(index / cols) * 28;
      parent.add(
        this.add
          .rectangle(cx, cy, chipW, 23, 0x0d2528, 0.96)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0x7be0c6, 0.62),
      );
      parent.add(
        this.add
          .text(cx + chipW / 2, cy + 5, chip, textStyle(mobile ? 9 : 10, '#d7fff5', '900'))
          .setOrigin(0.5, 0)
          .setWordWrapWidth(chipW - 10)
          .setAlign('center'),
      );
    });
  }

  private clientTurn(state: PrologueState, battle: BattleState): string {
    const c = battle.client;
    const pressure = Math.ceil(state.metrics.pressure / 18);
    const nextIntent = nextClientIntent(state, battle);
    battle.intentType = nextIntent.type;
    battle.storyPressure = nextIntent.pressure;
    let line = '';
    if (nextIntent.type === 'price') {
      c.budget -= 7 + pressure;
      c.anger += 5;
      battle.intent = nextIntent.text;
      line = `客户姐：${nextIntent.pressure.line}`;
      battle.log.unshift(line);
    } else if (nextIntent.type === 'scope') {
      c.scope += 10 + pressure;
      c.trust -= 4;
      state.metrics.patience -= 4;
      battle.intent = nextIntent.text;
      line = `客户姐：${nextIntent.pressure.line}`;
      battle.log.unshift(line);
    } else {
      c.anger += 8 + pressure;
      c.budget -= 4;
      c.scope += 4;
      battle.intent = nextIntent.text;
      line = `客户姐：${nextIntent.pressure.line}`;
      battle.log.unshift(line);
    }
    battle.client = clampClient(c);
    state.metrics = clampMetrics(state.metrics);
    return line;
  }

  private finishBattle(
    state: PrologueState,
    outcome: 'win' | 'partial' | 'fail',
  ): void {
    const battle = state.battle;
    let ending: Ending = 'poc-limbo';
    if (outcome === 'fail' || !battle) ending = 'free-burnout';
    else if (
      ((battle.used.walkaway || 0) >= 1 ||
        state.decisions.includes('customer:walkaway') ||
        state.decisions.includes('customerReversal:walkaway-line')) &&
      state.metrics.boundary >= 72 &&
      battle.client.scope <= 42
    )
      ending = 'clean-walkaway';
    else if (battle.client.budget >= 70 && battle.client.trust >= 52)
      ending = 'paid';
    else if (battle.client.trust >= 66 && battle.client.scope <= 72)
      ending = 'bounded-comp';
    state.mode = 'ending';
    state.beat = 'ending';
    state.ending = ending;
    addMilestoneForBeat(state, 'ending');
    state.log.unshift(endingSummary(ending));
    this.setState(state);
    const bridge = BEAT_BRIDGES.ending;
    if (bridge) this.showBeatBridge(bridge, () => this.redraw());
    else this.redraw();
  }

  private drawEnding(): void {
    document.querySelector('.yrpg-touch-bridge')?.setAttribute('hidden', '');
    this.cameras.main.stopFollow();
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    const state = this.state();
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    this.add.rectangle(0, 0, w, h, 0x081719, 1).setOrigin(0, 0);
    const report = routeReport(state);

    if (mobile) {
      addBoPortrait(
        this,
        28,
        34,
        108,
        138,
        state.ending === 'free-burnout' ? 'fail' : 'win',
      );
      const x = 28;
      const width = w - 56;
      const buttonGap = 10;
      const buttonY = h - 76;
      const buttonW = (width - buttonGap) / 2;
      const timelineH = h < 760 ? 64 : 78;
      const timelineY = Math.min(buttonY - timelineH - 14, 538);
      const closingY = 238;
      const closingH = clamp(timelineY - closingY - 14, 204, 286);
      this.add
        .text(152, 42, wrapCjk(endingTitle(state.ending), 10), textStyle(21, '#ffe6a8', '950'))
        .setLineSpacing(5)
        .setWordWrapWidth(w - 180);
      this.drawEndingBadge(x, 178, width, report, state);
      this.drawEndingClosingScene(x, closingY, width, closingH, state, report, true);
      this.drawEndingTimeline(x, timelineY, width, state, true);
      makeButton(
        this,
        x,
        buttonY,
        buttonW,
        46,
        '重开第一天',
        () => {
          this.setState(defaultState());
          this.redraw();
          this.playOpening();
        },
        0x28566a,
        13,
      );
      makeButton(
        this,
        x + buttonW + buttonGap,
        buttonY,
        buttonW,
        46,
        '导出存档',
        () => this.showExportCode(),
        0x6e5428,
        13,
      );
      return;
    }

    addBoPortrait(
      this,
      56,
      96,
      172,
      220,
      state.ending === 'free-burnout' ? 'fail' : 'win',
    );
    const x = 274;
    const y = 66;
    const width = w - 330;
    this.add
      .text(x, y, endingTitle(state.ending), textStyle(28, '#ffe6a8', '950'))
      .setLineSpacing(5)
      .setWordWrapWidth(width);

    this.drawEndingClosingScene(x, y + 54, width, 208, state, report, false);
    this.drawEndingBadge(x, y + 276, width, report, state);
    this.drawEndingTimeline(x, y + 336, width, state, false);
    makeButton(
      this,
      x,
      h - 64,
      170,
      48,
      '重新开始第一天',
      () => {
        this.setState(defaultState());
        this.redraw();
        this.playOpening();
      },
      0x28566a,
      13,
    );
    makeButton(
      this,
      x + 188,
      h - 64,
      170,
      48,
      '导出存档码',
      () => this.showExportCode(),
      0x6e5428,
      13,
    );
  }

  private drawEndingBadge(
    x: number,
    y: number,
    w: number,
    report: RouteReport,
    state: PrologueState,
  ): void {
    this.add
      .rectangle(x, y, w, 46, 0x102b2e, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffdf86, 0.84);
    this.add
      .text(x + 14, y + 8, `路线徽章：${report.title}`, textStyle(13, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 88);
    this.add
      .text(x + w - 18, y + 10, report.grade, textStyle(18, '#fff8dc', '950'))
      .setOrigin(1, 0);
    this.add
      .text(
        x + 14,
        y + 27,
        `${STORY_BEATS.ending.clock} ${STORY_BEATS.ending.place} · 剩余行动 ${state.timeLeft}/${STARTING_TIME} · ${prepSummary(state)}`,
        textStyle(10, '#9ee8d1', '900'),
      )
      .setWordWrapWidth(w - 28);
  }

  private drawEndingScoreChips(
    x: number,
    y: number,
    w: number,
    scores: string[],
    mobile: boolean,
  ): void {
    const cols = mobile ? 2 : 4;
    const gap = 8;
    const chipW = (w - gap * (cols - 1)) / cols;
    scores.forEach((score, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = x + col * (chipW + gap);
      const cy = y + row * 34;
      this.add
        .rectangle(cx, cy, chipW, 26, 0x17373b, 0.98)
        .setOrigin(0, 0)
        .setStrokeStyle(1, score.endsWith('S') ? 0x7be0c6 : 0xffdf86, 0.72);
      this.add
        .text(cx + chipW / 2, cy + 6, score, textStyle(11, '#fff8dc', '950'))
        .setOrigin(0.5, 0)
        .setAlign('center')
        .setWordWrapWidth(chipW - 8);
    });
  }

  private drawEndingTimeline(
    x: number,
    y: number,
    w: number,
    state: PrologueState,
    mobile: boolean,
  ): void {
    const boxH = mobile ? 78 : 62;
    this.add
      .rectangle(x, y, w, boxH, 0x0d2528, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x5ea99a, 0.62);
    const line = mobile
      ? wrapCjk(storyCausalLine(state, true), 22)
      : storyCausalLine(state, true);
    this.add
      .text(x + 14, y + 8, '今日因果', textStyle(11, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 28);
    const body = this.add
      .text(x + 14, y + 27, line, textStyle(11, '#e9f8df', '900'))
      .setWordWrapWidth(w - 28)
      .setLineSpacing(3);
    fitText(body, w - 28, boxH - 34, 11, 8);
  }

  private drawEndingClosingScene(
    x: number,
    y: number,
    w: number,
    h: number,
    state: PrologueState,
    report: RouteReport,
    mobile: boolean,
  ): void {
    const echoes = endingEchoes(state).slice(0, mobile && h < 250 ? 3 : 4);
    const line = endingClosingSceneLine(state, report);
    this.add
      .rectangle(x, y, w, h, 0x102b2e, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffdf86, 0.56);
    this.add
      .text(x + 14, y + 9, '会议室收工', textStyle(11, '#ffe6a8', '950'))
      .setWordWrapWidth(w - 28);
    const sceneLine = this.add
      .text(
        x + 14,
        y + 29,
        mobile ? wrapCjk(line, 22) : line,
        textStyle(mobile ? 10 : 11, '#e9f8df', '900'),
      )
      .setWordWrapWidth(w - 28);
    fitText(sceneLine, w - 28, mobile ? 28 : 18, mobile ? 10 : 11, 8);

    let echoX = x + 14;
    let echoW = w - 28;
    if (mobile) {
      const propY = y + 52;
      ['账单', '范围单', '试点记录'].forEach((label, index) => {
        const propW = (w - 44) / 3;
        const px = x + 14 + index * (propW + 8);
        this.add
          .rectangle(px, propY, propW, 14, 0xfff0b8, 0.92)
          .setOrigin(0, 0)
          .setStrokeStyle(1, 0x6b4b35, 0.58);
        this.add
          .text(px + propW / 2, propY + 2, label, textStyle(7, '#173331', '950'))
          .setOrigin(0.5, 0)
          .setAlign('center')
          .setWordWrapWidth(propW - 6);
      });
    } else {
      const tableX = x + 14;
      const tableY = y + 52;
      const tableW = Math.min(220, w * 0.34);
      const tableH = h - 64;
      this.add
        .rectangle(tableX, tableY, tableW, tableH, 0x0d2528, 0.84)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x5ea99a, 0.48);
      this.add
        .ellipse(tableX + tableW / 2, tableY + tableH / 2 + 3, tableW - 42, 34, 0x6b4b35, 0.78)
        .setStrokeStyle(1, 0xffdf86, 0.44);
      ['账单', '范围单', '试点记录'].forEach((label, index) => {
        const px = tableX + 42 + index * 56;
        const py = tableY + tableH / 2 - 10 + (index % 2) * 6;
        this.add
          .rectangle(px, py, 48, 18, 0xfff0b8, 0.9)
          .setStrokeStyle(1, 0x6b4b35, 0.52);
        this.add
          .text(px + 24, py + 4, label, textStyle(8, '#173331', '950'))
          .setOrigin(0.5, 0)
          .setWordWrapWidth(42)
          .setAlign('center');
      });
      echoX = tableX + tableW + 14;
      echoW = x + w - 14 - echoX;
    }

    const cardTop = y + (mobile ? 88 : 52);
    const gap = mobile ? 7 : 6;
    const cols = mobile ? 1 : 1;
    const rows = echoes.length;
    const cardW = echoW;
    const cardH = Math.max(mobile ? 35 : 27, (h - (cardTop - y) - gap * (rows - 1) - 10) / rows);
    echoes.forEach((echo, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = echoX + col * (cardW + gap);
      const cy = cardTop + row * (cardH + gap);
      const profile = SPEAKERS[echo.speaker];
      this.add
        .rectangle(cx, cy, cardW, cardH, 0x0d2528, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(1, profile.color, 0.68);
      this.add
        .rectangle(cx, cy, 5, cardH, profile.color, 0.9)
        .setOrigin(0, 0);
      this.add
        .text(cx + 12, cy + 6, profile.name, textStyle(mobile ? 10 : 10, '#ffe6a8', '950'))
        .setWordWrapWidth(mobile ? 54 : 60);
      const body = this.add
        .text(
          cx + (mobile ? 76 : 76),
          cy + (mobile ? 6 : 5),
          mobile ? wrapCjk(echo.line, 17) : echo.line,
          textStyle(mobile ? 10 : 10, '#f4f1d9', '850'),
        )
        .setLineSpacing(2)
        .setWordWrapWidth(cardW - 88);
      fitText(body, cardW - 88, cardH - 10, mobile ? 10 : 10, mobile ? 8 : 8);
    });
  }

  private showMenu(): void {
    const state = this.state();
    this.showDialog(
      '今日资料',
      `${BEAT_LABEL[state.beat]}\n时间地点：${STORY_BEATS[state.beat].clock} / ${STORY_BEATS[state.beat].place}\n\n当前冲突：${STORY_BEATS[state.beat].current}\n本幕目标：${STORY_BEATS[state.beat].goal}\n赢法：${STORY_BEATS[state.beat].win}\n失败代价：${STORY_BEATS[state.beat].fail}\n终幕影响：${STORY_BEATS[state.beat].endgame}\n\n今日因果：${storyCausalLine(state)}\n\n章节：${milestoneSummary(state)}\n剩余行动：${state.timeLeft}/${STARTING_TIME}\n${prepSummary(state)}\n${evidenceSummary(state)}\n${debtSummary(state)}\n行动花费：${timeSpendSummary(state)}\n选择：${state.decisions.map(decisionLabel).join(' / ') || '暂无'}\n\n这版是单日序章，重点是把“收钱、补一次、拉倒”的冲突打完整。`,
      [
        { label: '继续', action: () => this.closeModal() },
        { label: '导出存档码', action: () => this.showExportCode() },
        {
          label: '导入存档码',
          action: () => this.importCode(),
        },
        {
          label: '重开第一天',
          action: () => {
            this.setState(defaultState());
            this.redraw();
            this.playOpening();
          },
        },
      ],
    );
  }

  private showExportCode(): void {
    const code = encodeSave(this.state());
    navigator.clipboard?.writeText(code).catch(() => undefined);
    this.showDialog(
      '存档迁移码',
      `${code}\n\n已经尝试复制到剪贴板。复制失败也没事，这里整段就是存档。`,
      [{ label: '收起', action: () => this.closeModal(true) }],
    );
  }

  private importCode(): void {
    const value = window.prompt('粘贴 YBPROLOGUE1: 开头的存档码');
    if (!value) return;
    try {
      this.setState(decodeSave(value));
      this.redraw();
    } catch {
      this.showDialog('导入失败', '存档码不完整，博哥不认半截表。', [
        { label: '知道了', action: () => this.closeModal(true) },
      ]);
    }
  }

  private showDialog(
    title: string,
    body: string,
    choices: DialogChoice[],
    speaker: SpeakerId = 'system',
  ): void {
    this.setTouchBridgeHidden(true);
    this.modal?.destroy();
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.modalTitle = title;
    this.modalBody = body;
    this.modalChoices = choices;
    const w = this.scale.width;
    const h = this.scale.height;
    const mobile = this.isPortrait();
    const hasForecast = choices.some((choice) => choice.forecast);
    const managementHint = hasForecast && shouldShowManagementHint(title, choices)
      ? dialogManagementHint(title, this.state(), choices)
      : undefined;
    this.modalManagementHint = managementHint;
    const boxW = Math.min(w - 32, mobile ? 430 : 720);
    const forecastBoxH = mobile
      ? choices.length >= 3
        ? 650
        : 552
      : choices.length >= 3
        ? 560
        : 486;
    const boxH = Math.min(h - 64, hasForecast ? forecastBoxH : mobile ? 460 : 380);
    const x = (w - boxW) / 2;
    const y = (h - boxH) / 2;
    const c = this.add.container(0, 0).setDepth(500).setScrollFactor(0);
    c.add(this.add.rectangle(0, 0, w, h, 0x020808, 0.62).setOrigin(0, 0));
    c.add(
      this.add
        .rectangle(x, y, boxW, boxH, 0x102b2e, 0.98)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffdf86, 0.86),
    );
    const portraitW = mobile ? 88 : 124;
    const textX = mobile ? x + 22 : x + portraitW + 42;
    const textW = mobile ? boxW - 44 : boxW - portraitW - 64;
    if (!mobile)
      c.add(this.drawDialogSpeaker(x + 22, y + 26, portraitW, speaker));
    c.add(
      this.add
        .text(
          textX,
          y + 20,
          wrapCjk(title, mobile ? 14 : 20),
          textStyle(mobile ? 21 : 25, '#ffe6a8', '950'),
        )
        .setWordWrapWidth(textW),
    );
    if (mobile) {
      const profile = SPEAKERS[speaker];
      c.add(
        this.add
          .text(
            textX,
            y + 68,
            `${profile.name} · ${profile.tone}`,
            textStyle(10, '#98ddcf', '900'),
          )
          .setWordWrapWidth(textW),
      );
    }
    const choiceH = hasForecast ? (mobile ? 92 : 92) : 40;
    const choiceGap = hasForecast ? 8 : 8;
    const buttonY = y + boxH - choices.length * (choiceH + choiceGap) + choiceGap - 18;
    const hintY = y + (mobile ? 92 : 58);
    if (managementHint) {
      c.add(
        makeManagementHintCard(
          this,
          textX,
          hintY,
          textW,
          mobile ? 42 : 38,
          managementHint,
          mobile,
        ),
      );
    }
    const bodyY = y + (mobile ? (managementHint ? 142 : 94) : managementHint ? 104 : 86);
    const bodyText = this.add
      .text(
        textX,
        bodyY,
        wrapCjk(body, mobile ? 22 : 40),
        textStyle(mobile ? 13 : 15, '#f4f1d9', '850'),
      )
      .setLineSpacing(7)
      .setWordWrapWidth(textW);
    fitText(
      bodyText,
      textW,
      Math.max(managementHint ? 38 : 72, buttonY - bodyY - 14),
      mobile ? 13 : 15,
      mobile ? 10 : 11,
    );
    c.add(bodyText);
    choices.forEach((choice, index) => {
      if (hasForecast && choice.forecast) {
        c.add(
          makeChoiceCard(
            this,
            x + 22,
            buttonY + index * (choiceH + choiceGap),
            boxW - 44,
            choiceH,
            choice,
            () => this.chooseDialog(index),
            mobile,
          ),
        );
        return;
      }
      c.add(
        makeButton(
          this,
          x + 22,
          buttonY + index * 48,
          boxW - 44,
          40,
          choice.detail ? `${choice.label} | ${choice.detail}` : choice.label,
          () => this.chooseDialog(index),
          index === 0 ? 0x28566a : 0x5c4d34,
          mobile ? 11 : 12,
        ),
      );
    });
    this.modal = c;
  }

  private drawDialogSpeaker(
    x: number,
    y: number,
    size: number,
    speaker: SpeakerId,
  ): Phaser.GameObjects.Container {
    const profile = SPEAKERS[speaker];
    const c = this.add.container(x, y);
    c.add(
      this.add
        .rectangle(0, 0, size, size + 58, 0x0b2022, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(2, profile.color, 0.9),
    );
    if (speaker === 'bo') {
      const bo = this.add.sprite(size / 2, size / 2 + 4, 'boPortraits', 0);
      bo.setScale(
        Math.min((size - 14) / BO_PORTRAIT_W, (size - 10) / BO_PORTRAIT_H),
      );
      c.add(bo);
    } else {
      const sprite = this.add.sprite(size / 2, size / 2 + 6, profile.texture);
      sprite.setScale(Math.min((size - 10) / 128, (size - 8) / 160));
      c.add(sprite);
    }
    c.add(
      this.add
        .text(size / 2, size + 10, profile.name, textStyle(13, '#fff8dc', '950'))
        .setOrigin(0.5, 0)
        .setWordWrapWidth(size - 10)
        .setAlign('center'),
    );
    c.add(
      this.add
        .text(size / 2, size + 30, profile.role, textStyle(9, '#d7f3e9', '850'))
        .setOrigin(0.5, 0)
        .setWordWrapWidth(size - 10)
        .setAlign('center'),
    );
    return c;
  }

  private chooseDialog(index = 0): void {
    if (!this.modal) return;
    const choice = this.modalChoices[index];
    if (!choice) return;
    if (this.modalBlocking) this.modalBlocking = false;
    choice.action();
  }

  private closeModal(redraw = false): void {
    if (this.modalBlocking && !redraw) {
      this.chooseDialog(0);
      return;
    }
    this.modal?.destroy();
    this.modal = undefined;
    this.modalTitle = '';
    this.modalBody = '';
    this.modalChoices = [];
    this.modalManagementHint = undefined;
    this.modalBlocking = false;
    this.activeBridge = undefined;
    this.activeOutcome = undefined;
    this.activePhaseBreak = undefined;
    this.setTouchBridgeHidden(this.state().mode !== 'map');
    if (redraw) this.redraw();
  }

  private setTouchBridgeHidden(hidden: boolean): void {
    const bridge = document.querySelector('.yrpg-touch-bridge');
    if (!bridge) return;
    if (hidden) bridge.setAttribute('hidden', '');
    else bridge.removeAttribute('hidden');
  }

  private isPortrait(): boolean {
    return this.scale.width < 720 && this.scale.height > this.scale.width;
  }

  private installQa(): void {
    window.__YUANBO_PROLOGUE_QA__ = {
      snapshot: () => {
        const state = this.state();
        return {
          beat: state.beat,
          mode: state.mode,
          storageKey: STORAGE_KEY,
          objective: OBJECTIVE[state.beat],
          storyCard: { ...STORY_BEATS[state.beat] },
          mapHudMode: state.mode === 'map'
            ? state.beat === 'wake'
              ? 'opening-vignette'
              : this.isPortrait()
                ? 'compact-map'
                : 'chapter-strip'
            : state.mode,
          mapStage: state.mode === 'map'
            ? mapStageSnapshot(state)
            : null,
          stageComposition: state.mode === 'map'
            ? stageComposition(state)
            : null,
          sceneCue: SCENE_CUES[state.beat]
            ? {
                title: SCENE_CUES[state.beat]?.title,
                line: SCENE_CUES[state.beat]?.line,
              }
            : null,
          storySetPiece: state.mode === 'map' && storySetPieceForBeat(state.beat)
            ? { ...storySetPieceForBeat(state.beat)! }
            : null,
          sceneMemoryProps: state.mode === 'map'
            ? sceneMemoryProps(state).map((prop) => ({ ...prop }))
            : [],
          sceneEvents: (SCENE_EVENTS[state.beat] || []).map((event) => ({ ...event })),
          actorBarks: activeActorBarks(state),
          boThought: boThoughtLine(state),
          boThoughtBox: this.boThought
            ? { x: Math.round(this.boThought.x), y: Math.round(this.boThought.y) }
            : null,
          openingInbox: state.beat === 'wake'
            ? OPENING_INBOX.map((item) => ({ ...item }))
            : [],
          openingTargets: state.beat === 'wake'
            ? this.openingMessageTargets().map((item) => ({ ...item }))
            : [],
          openingScene: state.beat === 'wake'
            ? {
                title: '工位亮屏',
                line: '办公室还没完全亮，只有博哥工位先跳出财务、老板、客户三条未读。',
                props: OPENING_INBOX.map((item) => item.from),
                layout: this.isPortrait()
                  ? 'mobile-contained-incident-desk'
                  : 'desktop-incident-desk',
              }
            : null,
          openingInboxBoard: this.modalTitle === '博哥工位：三条未读工单'
            ? {
                boardMode: 'opening-inbox-board',
                messages: OPENING_INBOX.map((item) => ({
                  id: item.id,
                  from: item.from,
                  title: item.title,
                  line: item.line,
                })),
                routes: OPENING_INBOX_CHOICES.map((choice) => ({
                  decision: choice.decision,
                  route: choice.route,
                  label: choice.label,
                  boLine: choice.boLine,
                  endgame: choice.endgame,
                })),
              }
            : null,
          ledgerSorting: {
            complete: ledgerSortingComplete(state),
            done: ledgerSortedIds(state),
            boardMode: 'ticket-slot-board',
            slots: ledgerSortSlots(state),
            remaining: LEDGER_SORT_ITEMS.filter(
              (item) => !state.decisions.includes(ledgerSortDecision(item.id)),
            ).map((item) => ({
              id: item.id,
              label: item.label,
              target: item.target,
            })),
          },
          customerJokeBoard: this.modalTitle === '客户语音拆句：报价、补偿、拉倒'
            ? {
                boardMode: 'voice-fragment-board',
                fragments: CUSTOMER_JOKE_FRAGMENTS.map((fragment) => ({
                  id: fragment.id,
                  quote: fragment.quote,
                  lane: fragment.lane,
                  pressure: fragment.pressure,
                })),
                routes: CUSTOMER_JOKE_ROUTES.map((route) => ({
                  decision: route.decision,
                  route: route.route,
                  label: route.label,
                  boLine: route.boLine,
                  endgame: route.endgame,
                })),
              }
            : null,
          customerReversalBoard: this.modalTitle === '客户反悔拆板：免费、上线、拉倒'
            ? {
                boardMode: 'reversal-pressure-board',
                pressures: CUSTOMER_REVERSAL_PRESSURES.map((pressure) => ({
                  id: pressure.id,
                  label: pressure.label,
                  quote: pressure.quote,
                  lane: pressure.lane,
                  pressure: pressure.pressure,
                })),
                routes: CUSTOMER_REVERSAL_ROUTES.map((route) => ({
                  decision: route.decision,
                  opening: route.opening,
                  route: route.route,
                  label: route.label,
                  boLine: route.boLine,
                  endgame: route.endgame,
                })),
              }
            : null,
          bossLaunchBoard: this.modalTitle === '老板上线拆板：今天上线怎么说'
            ? {
                boardMode: 'launch-pressure-board',
                pressures: BOSS_LAUNCH_PRESSURES.map((pressure) => ({
                  id: pressure.id,
                  label: pressure.label,
                  quote: pressure.quote,
                  lane: pressure.lane,
                  pressure: pressure.pressure,
                })),
                routes: BOSS_LAUNCH_ROUTES.map((route) => ({
                  decision: route.decision,
                  route: route.route,
                  label: route.label,
                  boLine: route.boLine,
                  endgame: route.endgame,
                })),
              }
            : null,
          prepWorkbench: this.modalTitle === '战前准备桌：台词彩排工作台'
            ? {
                boardMode: 'rehearsal-workbench',
                timeLeft: state.timeLeft,
                prepared: [...state.preps],
                cards: prepWorkbenchCards(state).map((card) => ({ ...card })),
              }
            : null,
          player: { ...state.player },
          direction: state.direction,
          metrics: { ...state.metrics },
          clues: [...state.clues],
          decisions: [...state.decisions],
          debts: [...state.debts],
          preps: [...state.preps],
          timeLeft: state.timeLeft,
          timeLog: [...state.timeLog],
          milestones: [...state.milestones],
          milestoneSummary: milestoneSummary(state, true),
          battleReadiness: battleReadinessSummary(state),
          causalChain: storyCausalChain(state),
          causalLine: storyCausalLine(state, true),
          storyStep: {
            current: beatStep(state.beat),
            total: BEAT_ORDER.length,
          },
          zoneOutcomes: Object.fromEntries(
            STAGE_ZONES.map((zone) => [zone.id, zoneOutcomeLabel(zone.id, state)]),
          ),
          nearest: this.nearest?.id || '',
          clickMoveActive: Boolean(this.clickTarget),
          pendingInteraction: this.pendingInteraction
            ? { ...this.pendingInteraction }
            : null,
          targetGuide: this.targetGuideSnapshot(),
          hotspotVisuals: state.mode === 'map'
            ? hotspotVisualSnapshots(state)
            : [],
          modalTitle: this.modal ? this.modalTitle : '',
          modalBody: this.modal ? this.modalBody : '',
          modal: this.modal ? this.modalChoices.map((choice) => choice.label) : [],
          managementHint: this.modal && this.modalManagementHint
            ? { ...this.modalManagementHint }
            : null,
          touchBridgeHidden: document
            .querySelector('.yrpg-touch-bridge')
            ?.hasAttribute('hidden') ?? false,
          choiceForecasts: this.modal
            ? this.modalChoices
                .filter((choice) => choice.forecast)
                .map((choice) => ({
                  label: choice.label,
                  speech: choiceSpeechLine(choice),
                  cost: actionForecastCost(choice),
                  recommendation: choiceManagementRecommendation(choice, state),
                  route: choice.forecast?.route,
                  gain: choice.forecast?.gain,
                  risk: choice.forecast?.risk,
                  endgame: routeEndgameLine(
                    choice.forecast?.route,
                    choice.forecast?.endgame,
                  ),
                }))
            : [],
          bridgeCard: this.modal && this.activeBridge
            ? {
                title: this.activeBridge.title,
                kicker: this.activeBridge.kicker,
                sceneLine: this.activeBridge.sceneLine,
                boLine: this.activeBridge.boLine,
                nextAction: this.activeBridge.nextAction,
                nextBeat: this.activeBridge.nextBeat,
                storyboard: bridgeStoryboardPanels(this.activeBridge, state),
                battleDossier: this.activeBridge.nextBeat === 'battle'
                  ? battleDossierLines(state)
                  : [],
              }
            : null,
          outcomeCard: this.modal && this.activeOutcome
            ? { ...this.activeOutcome, chips: [...this.activeOutcome.chips] }
            : null,
          phaseBreakCard: this.modal && this.activePhaseBreak
            ? { ...this.activePhaseBreak }
            : null,
          battle: state.battle
            ? {
                sceneMode: 'meeting-table',
                round: state.battle.round,
                phase: state.battle.phase,
                client: { ...state.battle.client },
                intent: state.battle.intent,
                intentType: state.battle.intentType,
                storyPressure:
                  state.battle.storyPressure ||
                  storyPressureFor(state, state.battle.phase, state.battle.intentType),
                turnBeat: battleTurnBeat(state, state.battle),
                duelFocus: battleDuelFocus(state, state.battle),
                tableLines: negotiationTableLines(state, state.battle),
                tableTokens: negotiationTokens(state, state.battle),
                tableProps: battleTableProps(state),
                closingGoals: battleClosingGoals(state, state.battle),
                suggestedSkills: battleCounterSkills(state, state.battle),
                skillCommands: battleCommandCards(state, state.battle),
                skillPreviews: Object.fromEntries(
                  BATTLE_SKILLS.map((skill) => [
                    skill.id,
                    skillPreview(skill.id, state, state.battle!),
                  ]),
                ),
                lastSkill: state.battle.lastSkill || '',
                lastFeedback: state.battle.lastFeedback || '',
                lastImpact: state.battle.lastImpact
                  ? {
                      title: state.battle.lastImpact.title,
                      deltas: [...state.battle.lastImpact.deltas],
                      customerLine: state.battle.lastImpact.customerLine,
                      nextIntent: state.battle.lastImpact.nextIntent,
                      phaseBreak: state.battle.lastImpact.phaseBreak,
                      fx: state.battle.lastImpact.fx,
                    }
                  : null,
              }
            : null,
          ending: state.ending,
          endingEchoes: state.mode === 'ending'
            ? endingEchoes(state).map((echo) => ({ ...echo }))
            : [],
          endingScene: state.mode === 'ending'
            ? {
                title: routeReport(state).title,
                line: endingClosingSceneLine(state, routeReport(state)),
                props: ['账单', '范围单', '试点记录'],
                layout: this.isPortrait() ? 'mobile-echo-stack' : 'desktop-echo-stack',
                echoCount: endingEchoes(state).length,
              }
            : null,
          camera: {
            scrollX: Math.round(this.cameras.main.scrollX),
            scrollY: Math.round(this.cameras.main.scrollY),
          },
          canvas: { width: this.scale.width, height: this.scale.height },
        };
      },
      reset: () => {
        this.setState(defaultState());
        this.redraw();
      },
      moveTo: (id) => this.qaMoveTo(id),
      interact: () => this.interact(),
      interactWith: (id) => {
        this.qaInteractWith(id);
      },
      choose: (index = 0) => this.chooseDialog(index),
      useSkill: (id) => this.useBattleSkill(id),
      exportCode: () => encodeSave(this.state()),
      importCode: (code) => {
        try {
          this.setState(decodeSave(code));
          this.redraw();
          return true;
        } catch {
          return false;
        }
      },
    };
  }

  private qaMoveTo(id: string): void {
    const state = this.state();
    const actor =
      ACTORS.find((item) => item.id === id && item.beat === state.beat) ||
      ACTORS.find((item) => item.id === id);
    const spot = HOTSPOTS.find((item) => item.id === id);
    const target = actor
      ? this.actorApproachPoint(actor)
      : spot
        ? this.hotspotApproachPoint(spot)
        : null;
    if (!target) return;
    state.player = target;
    this.setState(state);
    if (state.mode === 'map') this.redraw();
  }

  private qaInteractWith(id: string): void {
    const state = this.state();
    if (this.modal) {
      this.interact();
      return;
    }
    if (state.mode !== 'map') return;
    const actor = ACTORS.find((item) => item.id === id && item.beat === state.beat);
    if (actor) {
      this.qaMoveTo(id);
      this.talkToActor(actor);
      return;
    }
    const spot = HOTSPOTS.find((item) => item.id === id);
    if (!spot) return;
    this.qaMoveTo(id);
    if (!hotspotVisible(spot, state)) {
      this.showDialog(
        '还没到这一步',
        '这个点位现在先压暗，等剧情推进后再处理，避免第一屏像工具表。',
        [{ label: '知道了', action: () => this.closeModal(true) }],
      );
      return;
    }
    this.useHotspot(spot);
  }
}

function getInitialGameSize(): { width: number; height: number } {
  if (window.innerWidth <= 720 && window.innerHeight > window.innerWidth) {
    return {
      width: Math.max(360, Math.min(540, window.innerWidth)),
      height: Math.max(640, Math.min(960, window.innerHeight)),
    };
  }
  return { width: GAME_W, height: GAME_H };
}

function getRenderResolution(): number {
  return Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
}

function createTouchControls(
  root: HTMLElement,
  game: Phaser.Game,
): HTMLDivElement {
  const controls = document.createElement('div');
  controls.className = 'yrpg-touch-bridge';
  const stick = document.createElement('div');
  stick.className = 'yrpg-touch-bridge__stick';
  const knob = document.createElement('div');
  knob.className = 'yrpg-touch-bridge__knob';
  stick.appendChild(knob);
  const interact = document.createElement('button');
  interact.type = 'button';
  interact.className = 'yrpg-touch-bridge__interact';
  interact.textContent = '互动';

  const setVector = (x: number, y: number) => {
    const scene = game.scene.getScene('PrologueScene') as
      | PrologueScene
      | undefined;
    if (game.scene.isActive('PrologueScene')) scene?.setVirtualVector(x, y);
  };
  const syncLabel = () => {
    const scene = game.scene.getScene('PrologueScene') as
      | PrologueScene
      | undefined;
    interact.textContent =
      game.scene.isActive('PrologueScene') && scene
        ? scene.currentInteractionLabel()
        : '互动';
  };
  let activePointer: number | null = null;
  const reset = () => {
    activePointer = null;
    knob.style.transform = 'translate(-50%, -50%)';
    setVector(0, 0);
  };
  const update = (event: PointerEvent) => {
    const rect = stick.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.42;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawX = event.clientX - cx;
    const rawY = event.clientY - cy;
    const distance = Math.hypot(rawX, rawY);
    const clamped = Math.min(distance, radius);
    const nx = distance ? rawX / distance : 0;
    const ny = distance ? rawY / distance : 0;
    knob.style.transform = `translate(calc(-50% + ${nx * clamped}px), calc(-50% + ${ny * clamped}px))`;
    setVector(distance < 8 ? 0 : nx * (clamped / radius), distance < 8 ? 0 : ny * (clamped / radius));
  };
  stick.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    activePointer = event.pointerId;
    try {
      stick.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer checks may not support capture.
    }
    update(event);
  });
  stick.addEventListener('pointermove', (event) => {
    if (event.pointerId === activePointer) update(event);
  });
  stick.addEventListener('pointerup', reset);
  stick.addEventListener('pointercancel', reset);
  stick.addEventListener('lostpointercapture', reset);
  interact.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const scene = game.scene.getScene('PrologueScene') as
      | PrologueScene
      | undefined;
    if (game.scene.isActive('PrologueScene')) scene?.interact();
    syncLabel();
  });
  controls.append(stick, interact);
  root.appendChild(controls);
  const timer = window.setInterval(syncLabel, 250);
  const remove = controls.remove.bind(controls);
  controls.remove = () => {
    window.clearInterval(timer);
    remove();
  };
  return controls;
}

function defaultState(): PrologueState {
  return {
    version: 1,
    beat: 'wake',
    mode: 'map',
    player: { x: 178, y: 438 },
    direction: 'down',
    metrics: {
      cash: 320,
      trust: 38,
      patience: 86,
      boundary: 48,
      pressure: 34,
    },
    clues: [],
    decisions: [],
    debts: [],
    preps: [],
    timeLeft: STARTING_TIME,
    timeLog: [],
    milestones: ['open'],
    ending: '',
    log: [],
  };
}

function loadState(): PrologueState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

function persistState(state: PrologueState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
  } catch {
    // Local storage is best-effort for the browser game.
  }
}

function normalizeState(input: Partial<PrologueState>): PrologueState {
  const base = defaultState();
  const beat: Beat = [
    'wake',
    'finance',
    'financeAudit',
    'boss',
    'bossRehearsal',
    'customer',
    'customerReversal',
    'battle',
    'ending',
  ].includes(input.beat || '')
    ? (input.beat as Beat)
    : base.beat;
  const mode: Mode = ['map', 'battle', 'ending'].includes(input.mode || '')
    ? (input.mode as Mode)
    : beat === 'battle'
      ? 'battle'
      : beat === 'ending'
        ? 'ending'
        : 'map';
  return {
    ...base,
    ...input,
    version: 1,
    beat,
    mode,
    player: {
      x: clamp(Number(input.player?.x) || base.player.x, 48, GAME_W - 48),
      y: clamp(Number(input.player?.y) || base.player.y, 94, WORLD_H - 42),
    },
    direction: (['down', 'left', 'right', 'up'].includes(input.direction || '')
      ? input.direction
      : base.direction) as Direction,
    metrics: clampMetrics({ ...base.metrics, ...(input.metrics || {}) }),
    clues: Array.isArray(input.clues) ? input.clues.map(String).slice(0, 24) : [],
    decisions: Array.isArray(input.decisions)
      ? input.decisions.map(String).slice(0, 16)
      : [],
    debts: Array.isArray(input.debts)
      ? input.debts
          .filter((item): item is DebtId =>
            Object.prototype.hasOwnProperty.call(DEBTS, String(item)),
          )
          .slice(0, 8)
      : [],
    preps: Array.isArray(input.preps)
      ? input.preps
          .filter((item): item is PrepId =>
            PREP_OPTIONS.some((option) => option.id === item),
          )
          .slice(0, 3)
      : [],
    timeLeft: clamp(
      Math.floor(Number(input.timeLeft ?? STARTING_TIME)),
      0,
      STARTING_TIME,
    ),
    timeLog: Array.isArray(input.timeLog)
      ? input.timeLog.map(String).slice(0, STARTING_TIME)
      : [],
    milestones: normalizeMilestones(input.milestones),
    ending: (['', 'paid', 'bounded-comp', 'clean-walkaway', 'poc-limbo', 'free-burnout'].includes(input.ending || '')
      ? input.ending
      : '') as Ending,
    battle: input.battle
      ? {
          round: clamp(Math.floor(Number(input.battle.round) || 1), 1, 9),
          phase: clamp(Math.floor(Number(input.battle.phase) || 0), 0, 2),
          client: clampClient(input.battle.client || baseBattleClient()),
          used: { ...(input.battle.used || {}) },
          intent: String(input.battle.intent || ''),
          intentType: (['price', 'scope', 'anger'].includes(
            input.battle.intentType || '',
          )
            ? input.battle.intentType
            : 'price') as ClientIntentType,
          storyPressure: normalizeStoryPressure(input.battle.storyPressure),
          lastSkill: (['quote', 'compensate', 'boundary', 'walkaway', 'breathe'].includes(
            input.battle.lastSkill || '',
          )
            ? input.battle.lastSkill
            : undefined) as SkillId | undefined,
          lastFeedback: input.battle.lastFeedback
            ? String(input.battle.lastFeedback)
            : undefined,
          lastImpact: normalizeBattleImpact(input.battle.lastImpact),
          log: Array.isArray(input.battle.log)
            ? input.battle.log.map(String).slice(0, 6)
            : [],
        }
      : undefined,
    log: Array.isArray(input.log) ? input.log.map(String).slice(0, 10) : [],
  };
}

function encodeSave(state: PrologueState): string {
  return (
    SAVE_PREFIX +
    btoa(unescape(encodeURIComponent(JSON.stringify(normalizeState(state)))))
  );
}

function decodeSave(value: string): PrologueState {
  if (!value.startsWith(SAVE_PREFIX)) throw new Error('bad-prefix');
  const json = decodeURIComponent(
    escape(atob(value.slice(SAVE_PREFIX.length))),
  );
  return normalizeState(JSON.parse(json));
}

function baseBattleClient(): BattleClient {
  return { anger: 42, budget: 45, scope: 55, trust: 42 };
}

function normalizeBattleImpact(input: unknown): BattleImpact | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const raw = input as Partial<BattleImpact>;
  const skill = ['quote', 'compensate', 'boundary', 'walkaway', 'breathe'].includes(
    raw.skill || '',
  )
    ? (raw.skill as SkillId)
    : 'quote';
  const nextIntent = ['price', 'scope', 'anger'].includes(raw.nextIntent || '')
    ? (raw.nextIntent as ClientIntentType)
    : 'price';
  return {
    skill,
    title: String(raw.title || skillLabel(skill)),
    customerLine: String(raw.customerLine || ''),
    deltas: Array.isArray(raw.deltas) ? raw.deltas.map(String).slice(0, 5) : [],
    countered: Boolean(raw.countered),
    phaseBreak: Boolean(raw.phaseBreak),
    nextIntent,
    fx: skill,
  };
}

function normalizeStoryPressure(input: unknown): StoryPressure | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const raw = input as Partial<StoryPressure>;
  const counters = Array.isArray(raw.counters)
    ? raw.counters
        .filter((item): item is SkillId =>
          ['quote', 'compensate', 'boundary', 'walkaway', 'breathe'].includes(String(item)),
        )
        .slice(0, 3)
    : [];
  const source = String(raw.source || '');
  const line = String(raw.line || '');
  const replyHint = String(raw.replyHint || '');
  if (!source || !line || !replyHint) return undefined;
  return {
    source,
    line,
    replyHint,
    counters,
  };
}

function nextClientIntent(
  state: PrologueState,
  battle: BattleState,
): { type: ClientIntentType; text: string; pressure: StoryPressure } {
  const c = battle.client;
  let type: ClientIntentType = 'scope';
  if (battle.phase <= 0 || c.budget < 48) {
    type = 'price';
  } else if (battle.phase === 1 || c.scope >= c.anger || c.scope >= 68) {
    type = 'scope';
  } else if (state.metrics.patience <= 28 || c.anger >= 72) {
    type = 'anger';
  }
  const pressure = storyPressureFor(state, battle.phase, type);
  return { type, text: pressure.line, pressure };
}

function storyPressureFor(
  state: PrologueState,
  phase: number,
  type: ClientIntentType,
): StoryPressure {
  if (type === 'price') {
    if (state.debts.includes('budget-blame')) {
      return {
        source: '财务账单没钉死',
        line: '上午账单还没说清谁认，现在就来找我收钱？',
        replyHint: '把试用和正式服务拆开',
        counters: ['quote'],
      };
    }
    if (
      state.clues.includes('GPU 峰值曲线') ||
      state.decisions.includes('financeAudit:paid-pilot')
    ) {
      return {
        source: 'GPU 峰值曲线',
        line: '你说资源真的烧了，那哪部分是服务费，哪部分是情分？',
        replyHint: '用报价把钱落到包里',
        counters: ['quote'],
      };
    }
    return {
      source: '开场免费预期',
      line: '上次都免费，这次为什么不是继续售后？',
      replyHint: '先讲基础包和加急包',
      counters: ['quote', 'breathe'],
    };
  }
  if (type === 'scope' || phase === 1) {
    if (
      state.debts.includes('full-launch') ||
      state.debts.includes('overpromise') ||
      state.decisions.includes('boss:hard')
    ) {
      return {
        source: '老板今天上线承诺',
        line: '你们上午不是说今天上线吗？那就顺手全部上线吧。',
        replyHint: '缩回小范围试点',
        counters: ['boundary', 'compensate'],
      };
    }
    if (
      state.clues.includes('小范围试点验收句') ||
      state.preps.includes('poc-demo')
    ) {
      return {
        source: '小范围试点',
        line: '你说只补小范围，那我怎么知道不是拖时间？',
        replyHint: '把验收和范围写清',
        counters: ['boundary', 'compensate'],
      };
    }
    return {
      source: '免费再梳一次',
      line: '既然再梳一次，那今天顺手全部上线也不多吧？',
      replyHint: '补一次，但别补全世界',
      counters: ['compensate', 'boundary'],
    };
  }
  if (
    state.debts.includes('relationship-cold') ||
    state.decisions.includes('customer:walkaway')
  ) {
    return {
      source: '拉倒先上桌',
      line: '你刚才不是说不签就拉倒吗？现在到底谁拉倒？',
      replyHint: '给退场台阶',
      counters: ['walkaway', 'breathe'],
    };
  }
  if (
    state.clues.includes('拉倒留证据') ||
    state.preps.includes('walkaway-script')
  ) {
    return {
      source: '退场证据',
      line: '你要停可以，但别让我像被甩锅。',
      replyHint: '讲清暂停规则',
      counters: ['walkaway', 'boundary'],
    };
  }
  return {
    source: '客户拉倒威胁',
    line: '不行我就找别人，你给个痛快话。',
    replyHint: '别摔门，留台阶',
    counters: ['walkaway', 'breathe'],
  };
}

function intentLabel(type: ClientIntentType): string {
  return (
    {
      price: '砍价追问',
      scope: '需求变多',
      anger: '拉倒威胁',
    }[type] || type
  );
}

function battlePhaseLine(phase: number): string {
  return (
    {
      0: '先把钱说上桌',
      1: '把补一次锁成小范围',
      2: '拉倒也要留台阶',
    }[phase] || '看今天保住了什么'
  );
}

function phaseBreakStory(completedPhase: number): string {
  return (
    {
      0: '报价说法立住了：免费不是没有，免费得先有边界。',
      1: '补一次被缩成小范围试点，客户知道这不是无限续杯。',
      2: '拉倒被讲成规则，不是摔门，今天终于能收尾。',
    }[completedPhase] || '这一段谈判暂时压住了。'
  );
}

function phaseBreakPanels(
  completedPhase: number,
  battle: BattleState,
  story: string,
  nextGoal: string,
): PhaseBreakPanel[] {
  const tableLine =
    {
      0: '账单、基础包、加急包被推到桌面中间，客户不再只拿情分说事。',
      1: '“再梳一次”被写进小范围试点，顺手全部上线先停在纸面外。',
      2: '范围单、报价表和退场台阶都留在桌上，今天终于能收住。',
    }[completedPhase] || '桌面上少了一点混乱，多了一点能签字的东西。';
  return [
    {
      label: '客户让步',
      line: story,
      color: 0x2d8f73,
    },
    {
      label: '桌面变化',
      line: tableLine,
      color: 0xffdf86,
    },
    {
      label: '下一问',
      line: `${battle.intent} ${nextGoal}`,
      color: intentColor(battle.intentType),
    },
  ];
}

function phaseBreakChips(battle: BattleState): string[] {
  return [
    `怒气 ${Math.round(battle.client.anger)}`,
    `预算 ${Math.round(battle.client.budget)}`,
    `范围 ${Math.round(battle.client.scope)}`,
    `信任 ${Math.round(battle.client.trust)}`,
  ];
}

function phaseBreakNextGoal(phase: number): string {
  return (
    {
      1: '把“再梳一次”写成小范围试点，别让顺手变成全部上线。',
      2: '把拉倒讲体面：能做、不能做、加钱做都写清。',
    }[phase] || '看今天到底保住了什么。'
  );
}

function intentColor(type: ClientIntentType): number {
  return (
    {
      price: 0xf7d66d,
      scope: 0x94bfff,
      anger: 0xff836d,
    }[type] || 0xffdf86
  );
}

function suggestedSkillsForIntent(type: ClientIntentType): SkillId[] {
  return BATTLE_SKILLS.filter((skill) => skill.counters.includes(type)).map(
    (skill) => skill.id,
  );
}

function battleCounterSkills(state: PrologueState, battle: BattleState): SkillId[] {
  const pressure =
    battle.storyPressure || storyPressureFor(state, battle.phase, battle.intentType);
  return pressure.counters.length ? pressure.counters : suggestedSkillsForIntent(battle.intentType);
}

function battleTurnBeat(state: PrologueState, battle: BattleState): BattleTurnBeat {
  const pressure =
    battle.storyPressure || storyPressureFor(state, battle.phase, battle.intentType);
  const customer = `${pressure.source}：${pressure.line}`;
  const impact = battle.lastImpact;
  if (!impact) {
    return {
      customer,
      bo: `博哥还没回，先想清：${pressure.replyHint}`,
      result: `这一段先守住：${battlePhaseLine(battle.phase)}。`,
      tone: 'waiting',
    };
  }
  const deltas = impact.deltas.length
    ? impact.deltas.slice(0, 3).join('，')
    : '局面暂时僵住';
  return {
    customer,
    bo: `博哥打出「${skillLabel(impact.skill)}」：${skillFxLine(impact.fx)}`,
    result: `${impact.customerLine} / ${deltas}`,
    tone: impact.phaseBreak ? 'phase' : impact.countered ? 'countered' : 'risk',
  };
}

function battleDuelFocus(
  state: PrologueState,
  battle: BattleState,
): BattleDuelFocus {
  const pressure =
    battle.storyPressure || storyPressureFor(state, battle.phase, battle.intentType);
  const recommended = battleCounterSkills(state, battle).map(skillLabel);
  const impact = battle.lastImpact;
  return {
    title: PHASES[battle.phase]?.title || '看今天保住了什么',
    customerLine: impact?.customerLine || pressure.line,
    boHint: impact
      ? `刚才用了「${skillLabel(impact.skill)}」，下一句要接住：${pressure.replyHint}`
      : `先别急着答应。${pressure.replyHint}。`,
    tableLine: impact?.phaseBreak
      ? '这一段已经压住，客户会换角度继续追。'
      : impact?.countered
        ? '刚才说到点上，趁热把桌面证据推过去。'
        : '桌面还在发烫，下一句要把风险收回来。',
    recommended,
  };
}

function negotiationTableLines(
  state: PrologueState,
  battle: BattleState,
): NegotiationTableLines {
  const pressure =
    battle.storyPressure || storyPressureFor(state, battle.phase, battle.intentType);
  const impact = battle.lastImpact;
  if (!impact) {
    return {
      customer: pressure.line,
      bo: `先别急着答应。${pressure.replyHint}。`,
      table: '钱、关系、边界都在桌上，今天至少保住两个。',
    };
  }
  return {
    customer: impact.customerLine || pressure.line,
    bo: `${skillLabel(impact.skill)}：${skillFxLine(impact.fx)}。`,
    table: impact.phaseBreak
      ? '这一段谈判压住了，下一段客户会换角度继续追。'
      : impact.countered
        ? '说法对路，但还不能放松。'
        : '这张牌有副作用，下一回合要补回来。',
  };
}

function negotiationTokens(
  state: PrologueState,
  battle: BattleState,
): Array<{ label: string; value: string; color: number }> {
  return [
    {
      label: '钱',
      value: battle.client.budget >= 70 ? '能收' : battle.client.budget >= 45 ? '悬着' : '被砍',
      color: 0xf7d66d,
    },
    {
      label: '关系',
      value: battle.client.trust >= 68 ? '稳住' : battle.client.anger >= 78 ? '发烫' : '拉扯',
      color: 0x58d6a1,
    },
    {
      label: '边界',
      value:
        state.metrics.boundary >= 82 || battle.client.scope <= 58
          ? '清楚'
          : battle.client.scope >= 78
            ? '膨胀'
            : '待签',
      color: 0x94bfff,
    },
  ];
}

function battleClosingGoals(
  state: PrologueState,
  battle: BattleState,
): BattleClosingGoal[] {
  const moneyDone = battle.client.budget >= 55 && battle.client.trust >= 45;
  const scopeDone = battle.client.trust >= 62 && battle.client.scope <= 70;
  const exitDone =
    battle.client.anger <= 85 &&
    battle.client.scope <= 65 &&
    (battle.client.budget >= 50 || state.metrics.boundary >= 72);
  const moneyNeed =
    battle.client.budget < 55
      ? '再把服务费说到桌面上'
      : battle.client.trust < 45
        ? '让客户相信这不是乱加钱'
        : '报价已经能站住了';
  const scopeNeed =
    battle.client.scope > 70
      ? '把顺手全部上线缩回试点'
      : battle.client.trust < 62
        ? '补一次要让客户愿意签字'
        : '补偿已经锁进小范围';
  const exitNeed =
    battle.client.anger > 85
      ? '先降怒气，别把门摔上'
    : battle.client.scope > 65
        ? '退场前先把范围收住'
        : battle.client.budget < 50 && state.metrics.boundary < 72
          ? '补一张证据或台阶'
          : '拉倒可以体面收桌';
  return [
    {
      label: '收钱',
      status: moneyDone
        ? '能报价'
        : battle.client.budget < 35
          ? '快被砍没'
          : '还悬着',
      line: moneyNeed,
      progress: clamp((battle.client.budget / 55 + battle.client.trust / 45) / 2, 0, 1),
      color: 0xf7d66d,
      done: moneyDone,
    },
    {
      label: '补一次',
      status: scopeDone
        ? '小范围'
        : battle.client.scope > 82
          ? '补全世界'
          : '待签范围',
      line: scopeNeed,
      progress: clamp((battle.client.trust / 62 + (100 - battle.client.scope) / 30) / 2, 0, 1),
      color: 0x7be0c6,
      done: scopeDone,
    },
    {
      label: '体面拉倒',
      status: exitDone
        ? '能收桌'
        : battle.client.anger > 85
          ? '火太大'
          : '差台阶',
      line: exitNeed,
      progress: clamp(
        ((100 - battle.client.anger) / 15 +
          (100 - battle.client.scope) / 35 +
          Math.max(battle.client.budget / 50, state.metrics.boundary / 72)) /
          3,
        0,
        1,
      ),
      color: 0xff9fc8,
      done: exitDone,
    },
  ];
}

function battleTableProps(state: PrologueState): BattleTableProp[] {
  const ledgerLine = state.clues.includes('成本三列表')
    ? 'GPU 峰值和试用额度都在'
    : '账单还没完全拆明白';
  const launchLine =
    state.decisions.includes('boss:poc') ||
    state.decisions.includes('bossRehearsal:poc-script')
      ? '今天只承诺小范围试点'
      : state.debts.includes('full-launch')
        ? '全部上线承诺正在发烫'
        : '上线说法等客户验收';
  const customerLine =
    state.decisions.includes('customer:walkaway') ||
    state.decisions.includes('customerReversal:walkaway-line')
      ? '拉倒台阶已经放到桌边'
      : state.decisions.includes('customer:compensate')
        ? '补一次要锁小范围'
        : '再梳一次要先谈钱';
  return [
    { label: '账单', line: ledgerLine, color: 0xc98035 },
    { label: '上线', line: launchLine, color: 0x3d6fa5 },
    { label: '再梳一次', line: customerLine, color: 0x2d8f73 },
  ];
}

function skillLabel(id: SkillId): string {
  return BATTLE_SKILLS.find((skill) => skill.id === id)?.label || id;
}

function skillFxColor(id: SkillId): number {
  return (
    {
      quote: 0xf7d66d,
      compensate: 0x7be0c6,
      boundary: 0x7eb1ff,
      walkaway: 0xff9fc8,
      breathe: 0xb6c9d2,
    }[id] || 0xffdf86
  );
}

function skillFxLine(id: SkillId): string {
  return (
    {
      quote: '报价表推上桌',
      compensate: '补一次先写范围',
      boundary: '能做不能做写清',
      walkaway: '不合适就先停',
      breathe: '缓一口气再说',
    }[id] || skillLabel(id)
  );
}

function skillTableLine(id: SkillId): string {
  return (
    {
      quote: '先讲钱怎么收',
      compensate: '先稳关系但写小范围',
      boundary: '把能做不能做写清',
      walkaway: '不合适就体面暂停',
      breathe: '缓一口气再回话',
    }[id] || skillLabel(id)
  );
}

function battleCommandCards(
  state: PrologueState,
  battle: BattleState,
): BattleCommand[] {
  return BATTLE_SKILLS.map((skill) => {
    const preview = skillPreview(skill.id, state, battle);
    return {
      id: skill.id,
      label: skill.label,
      speech: battleSkillSpeechLine(skill.id),
      counter: battleSkillCounterLine(skill.id, battle.intentType),
      risk: battleSkillRiskLine(skill.id),
      effect: preview.effect,
      countered: preview.countered,
    };
  });
}

function battleSkillSpeechLine(id: SkillId): string {
  return (
    {
      quote: '先把钱怎么收讲清',
      compensate: '补一次可以，但只补小范围',
      boundary: '能做不能做先写清',
      walkaway: '不签范围就先暂停',
      breathe: '缓一口气，别把话说死',
    }[id] || skillTableLine(id)
  );
}

function battleSkillRiskLine(id: SkillId): string {
  return (
    {
      quote: '客户会觉得你突然现实',
      compensate: '顺手要求可能变多',
      boundary: '关系会冷一点',
      walkaway: '客户怒气可能上来',
      breathe: '核心问题还没解决',
    }[id] || '会留下副作用'
  );
}

function battleSkillCounterLine(id: SkillId, intent: ClientIntentType): string {
  const active =
    intent === 'price'
      ? '预算质疑'
      : intent === 'scope'
        ? '范围膨胀'
        : '怒气压场';
  if (id === 'quote') return intent === 'price' ? active : '预算质疑';
  if (id === 'compensate') return intent === 'anger' ? active : '关系降温';
  if (id === 'boundary') return intent === 'scope' ? active : '范围膨胀';
  if (id === 'walkaway') return intent === 'scope' || intent === 'anger' ? active : '僵局退场';
  return intent === 'anger' ? active : '耐心见底';
}

function battleImpact(
  context: BattleImpactContext,
  state: PrologueState,
  battle: BattleState,
  customerLine: string,
  phaseBreak: boolean,
): BattleImpact {
  return {
    skill: context.skill,
    title: `${skillLabel(context.skill)} ${
      phaseBreak ? '推动阶段' : context.countered ? '说法对路' : '留下副作用'
    }`,
    customerLine,
    deltas: battleDeltaSummary(
      context.beforeClient,
      battle.client,
      context.beforeMetrics,
      state.metrics,
    ),
    countered: context.countered,
    phaseBreak,
    nextIntent: battle.intentType,
    fx: context.skill,
  };
}

function battleDeltaSummary(
  beforeClient: BattleClient,
  afterClient: BattleClient,
  beforeMetrics: Metrics,
  afterMetrics: Metrics,
): string[] {
  const rows: Array<[string, number, number, boolean]> = [
    ['怒气', beforeClient.anger, afterClient.anger, false],
    ['预算', beforeClient.budget, afterClient.budget, true],
    ['需求', beforeClient.scope, afterClient.scope, false],
    ['信任', beforeClient.trust, afterClient.trust, true],
    ['耐心', beforeMetrics.patience, afterMetrics.patience, true],
    ['边界', beforeMetrics.boundary, afterMetrics.boundary, true],
  ];
  const deltas = rows
    .map(([label, before, after, higherIsGood]) => {
      const diff = Math.round(after - before);
      if (!diff) return '';
      const good = higherIsGood ? diff > 0 : diff < 0;
      return `${label} ${diff > 0 ? '+' : ''}${diff}${good ? '✓' : '!'}`;
    })
    .filter(Boolean);
  return deltas.length ? deltas.slice(0, 5) : ['局面持平'];
}

function skillPreview(
  id: SkillId,
  state: PrologueState,
  battle: BattleState,
): SkillPreview {
  const used = battle.used[id] || 0;
  const countered = battleCounterSkills(state, battle).includes(id);
  if (id === 'quote') {
    const budget =
      18 +
      (state.clues.includes('成本三列表') ? 6 : 0) +
      (state.preps.includes('pricing-rehearsal') ? 5 : 0);
    return {
      effect: `预算 +${budget} / 怒气 +${used ? 10 : 7}`,
      reason: state.preps.includes('pricing-rehearsal')
        ? '收费说法演练让报价不飘'
        : state.clues.includes('成本三列表')
          ? '成本三列表支撑报价'
          : '缺成本表，报价会显得生硬',
      countered,
    };
  }
  if (id === 'compensate') {
    const scope = (used ? 12 : 8) - (state.preps.includes('poc-demo') ? 6 : 0);
    return {
      effect: `信任 +18 / 需求 ${scope >= 0 ? '+' : ''}${scope}`,
      reason: state.preps.includes('poc-demo')
        ? '小范围试点演示把补偿锁进试点'
        : '补偿能稳关系，也会喂大范围',
      countered,
    };
  }
  if (id === 'boundary') {
    const scope = 20 + (state.clues.includes('范围单模板') ? 5 : 0);
    const trust = state.clues.includes('验收三句话') ? 7 : 3;
    return {
      effect: `需求 -${scope} / 信任 +${trust}`,
      reason: state.clues.includes('范围单模板')
        ? '范围单模板让范围更清楚'
        : '没有模板也能收范围，但会粗一点',
      countered,
    };
  }
  if (id === 'walkaway') {
    const scope = 13 + (state.preps.includes('walkaway-script') ? 6 : 0);
    const anger =
      (battle.phase >= 2 ? 7 : 15) -
      (state.preps.includes('walkaway-script') ? 5 : 0);
    return {
      effect: `需求 -${scope} / 怒气 +${anger}`,
      reason: state.preps.includes('walkaway-script')
        ? '拉倒台阶让退场更体面'
        : '没台阶早拉倒会伤关系',
      countered,
    };
  }
  return {
    effect: '耐心 +12 / 压力 -5',
    reason: '缓一手避免耐心被打穿',
    countered,
  };
}

function clampMetrics(metrics: Metrics): Metrics {
  return {
    cash: clamp(Math.floor(metrics.cash), 0, 9999),
    trust: clamp(Math.floor(metrics.trust), 0, 100),
    patience: clamp(Math.floor(metrics.patience), 0, 100),
    boundary: clamp(Math.floor(metrics.boundary), 0, 100),
    pressure: clamp(Math.floor(metrics.pressure), 0, 100),
  };
}

function clampClient(client: BattleClient): BattleClient {
  return {
    anger: clamp(Math.floor(client.anger), 0, 100),
    budget: clamp(Math.floor(client.budget), 0, 100),
    scope: clamp(Math.floor(client.scope), 0, 100),
    trust: clamp(Math.floor(client.trust), 0, 100),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createBoAnimations(scene: Phaser.Scene): void {
  const defs: Array<[Direction, number, number]> = [
    ['down', 0, 2],
    ['left', 3, 5],
    ['right', 6, 8],
    ['up', 9, 11],
  ];
  defs.forEach(([direction, start, end]) => {
    const key = `bo-walk-${direction}`;
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers('boWalk', { start, end }),
      frameRate: 8,
      repeat: -1,
    });
  });
}

function createNpcTextures(scene: Phaser.Scene): void {
  drawNpc(scene, 'npc-finance', 0xf3b45f, '财');
  drawNpc(scene, 'npc-boss', 0x74a9ff, '板');
  drawNpc(scene, 'npc-customer', 0x66d4a5, '姐');
  drawSpeakerPortrait(scene, 'speaker-finance', 0xf3b45f, '财', 'bob');
  drawSpeakerPortrait(scene, 'speaker-boss', 0x74a9ff, '板', 'square');
  drawSpeakerPortrait(scene, 'speaker-customer', 0x66d4a5, '姐', 'bun');
  drawSpeakerPortrait(scene, 'speaker-system', 0xf2d27b, '案', 'terminal');
}

function drawNpc(
  scene: Phaser.Scene,
  key: string,
  tint: number,
  badge: string,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x000000, 0.2).fillEllipse(32, 60, 42, 12);
  g.fillStyle(0x2b1d17, 1).fillRoundedRect(16, 6, 32, 18, 7);
  g.fillStyle(0xf0bc82, 1).fillRoundedRect(14, 18, 36, 28, 8);
  g.fillStyle(0x111111, 1).fillRect(22, 28, 5, 4).fillRect(38, 28, 5, 4);
  g.fillStyle(0x8d3e38, 1).fillRoundedRect(27, 38, 11, 4, 2);
  g.fillStyle(tint, 1).fillRoundedRect(13, 47, 38, 34, 4);
  g.fillStyle(0xf8f2d8, 1).fillRoundedRect(24, 51, 16, 14, 3);
  g.generateTexture(key, 64, 86);
  g.destroy();
  const t = scene.make.text({
    x: 0,
    y: 0,
    text: badge,
    style: textStyle(18, '#173538', '950'),
  });
  t.destroy();
}

function drawSpeakerPortrait(
  scene: Phaser.Scene,
  key: string,
  accent: number,
  badge: string,
  hair: 'bob' | 'square' | 'bun' | 'terminal',
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const px = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha = 1,
  ) => g.fillStyle(color, alpha).fillRoundedRect(x, y, w, h, 2);
  g.fillStyle(0x0b2225, 1).fillRoundedRect(0, 0, 128, 160, 8);
  g.lineStyle(4, accent, 1).strokeRoundedRect(4, 4, 120, 152, 8);
  g.fillStyle(accent, 0.18).fillEllipse(64, 88, 88, 94);
  g.fillStyle(0x000000, 0.22).fillEllipse(64, 138, 58, 12);

  if (hair === 'terminal') {
    px(28, 34, 72, 70, 0x173d40);
    px(36, 45, 56, 12, accent);
    px(36, 70, 38, 8, 0x7be0c6);
    px(36, 88, 48, 8, 0xf7d66d);
    px(46, 112, 36, 10, 0x284f5c);
  } else {
    g.fillStyle(0x221713, 1).fillEllipse(64, 47, 58, 44);
    if (hair === 'bob') {
      px(30, 48, 16, 60, 0x221713);
      px(82, 48, 16, 60, 0x221713);
    }
    if (hair === 'square') {
      px(34, 31, 60, 18, 0x171717);
      px(30, 42, 68, 16, 0x171717);
    }
    if (hair === 'bun') {
      g.fillStyle(0x221713, 1).fillEllipse(64, 31, 48, 30);
      g.fillStyle(0x221713, 1).fillEllipse(64, 17, 32, 20);
      px(30, 52, 16, 56, 0x221713);
      px(82, 52, 16, 56, 0x221713);
    }
    g.fillStyle(0xf0bd82, 1).fillEllipse(64, 73, 58, 62);
    g.fillStyle(0xf0bd82, 1).fillEllipse(34, 75, 10, 20);
    g.fillStyle(0xf0bd82, 1).fillEllipse(94, 75, 10, 20);
    px(44, 66, 8, 8, 0x111111);
    px(76, 66, 8, 8, 0x111111);
    g.lineStyle(3, 0x171717, 1).strokeRoundedRect(39, 61, 20, 16, 3);
    g.lineStyle(3, 0x171717, 1).strokeRoundedRect(69, 61, 20, 16, 3);
    g.lineStyle(2, 0x171717, 1).lineBetween(59, 69, 69, 69);
    px(55, 86, 20, 6, 0x9d4a3a);
    px(42, 102, 44, 10, 0xf0bd82);
    px(30, 111, 68, 34, accent);
    px(51, 116, 26, 18, 0xfff4d2);
    px(24, 116, 12, 28, 0xf0bd82);
    px(92, 116, 12, 28, 0xf0bd82);
  }

  g.fillStyle(0xfff4d2, 1).fillRoundedRect(83, 16, 30, 30, 6);
  const glyphColor = 0x102526;
  g.fillStyle(glyphColor, 1);
  if (badge === '财') {
    g.fillRect(92, 23, 12, 4).fillRect(90, 31, 16, 4).fillRect(96, 19, 4, 20);
  } else if (badge === '板') {
    g.fillRect(91, 22, 16, 4).fillRect(93, 30, 12, 4).fillRect(98, 18, 4, 22);
  } else if (badge === '姐') {
    g.fillEllipse(98, 30, 15, 12).fillRect(92, 28, 12, 4);
  } else {
    g.fillRect(91, 22, 16, 4).fillRect(91, 31, 16, 4).fillRect(94, 39, 10, 4);
  }
  g.generateTexture(key, 128, 160);
  g.destroy();
}

function addBoPortrait(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  mood: 'talk' | 'win' | 'fail',
): Phaser.GameObjects.Container {
  const frame = mood === 'talk' ? 0 : mood === 'win' ? 1 : 3;
  const c = scene.add.container(x, y);
  c.add(
    scene.add
      .rectangle(0, 0, w, h, 0x17373b, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, mood === 'fail' ? 0xff8b72 : 0xffdf86, 0.86),
  );
  c.add(scene.add.ellipse(w / 2, h - 20, w * 0.5, 16, 0x000000, 0.22));
  const sprite = scene.add.sprite(w / 2, h / 2 + 12, 'boPortraits', frame);
  sprite.setScale(Math.min((w - 14) / BO_PORTRAIT_W, (h - 16) / BO_PORTRAIT_H));
  c.add(sprite);
  c.add(
    scene.add
      .text(w / 2, 10, '博哥', textStyle(13, '#fff8dc', '950'))
      .setOrigin(0.5, 0),
  );
  return c;
}

function textStyle(
  size: number,
  color: string,
  weight = '800',
  backgroundColor?: string,
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    fontSize: `${size}px`,
    fontStyle: weight,
    color,
    backgroundColor,
    padding: backgroundColor ? { x: 5, y: 3 } : undefined,
    resolution: getRenderResolution(),
  };
}

function makeChoiceCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  choice: DialogChoice,
  onClick: () => void,
  mobile: boolean,
): Phaser.GameObjects.Container {
  const forecast = choice.forecast;
  const color = forecast ? actionRouteColor(forecast.route) : 0x28566a;
  const endgame = routeEndgameLine(forecast?.route, forecast?.endgame);
  const cost = actionForecastCost(choice);
  const routeLabel = cost === '1行动'
    ? `${forecast?.route || '行动'} · ${cost}`
    : forecast?.route || '行动';
  const speechLine = choiceSpeechLine(choice);
  const c = scene.add.container(x, y).setDepth(220);
  const bg = scene.add
    .rectangle(0, 0, w, h, 0x0d2528, 0.98)
    .setOrigin(0, 0)
    .setStrokeStyle(2, color, 0.82);
  const stripe = scene.add.rectangle(0, 0, 8, h, color, 0.95).setOrigin(0, 0);
  const route = scene.add
    .text(
      18,
      10,
      routeLabel,
      textStyle(10, '#102526', '950', colorTextBg(color)),
    )
    .setOrigin(0, 0);
  const title = scene.add
    .text(mobile ? 86 : 94, 8, `博哥说：${speechLine}`, textStyle(mobile ? 12 : 14, '#ffe6a8', '950'))
    .setWordWrapWidth(w - (mobile ? 104 : 112));
  const gain = scene.add
    .text(
      18,
      mobile ? 32 : 35,
      `当场变化：${forecast?.gain || choice.detail || '推进剧情'}`,
      textStyle(mobile ? 9 : 10, '#d7f3e9', '850'),
    )
    .setWordWrapWidth(mobile ? w - 36 : Math.floor((w - 42) / 2));
  const risk = scene.add
    .text(
      mobile ? 18 : Math.floor(w / 2) + 8,
      mobile ? 51 : 35,
      `代价：${forecast?.risk || '暂无明显风险'}`,
      textStyle(mobile ? 9 : 10, '#fff0c6', '850'),
    )
    .setWordWrapWidth(mobile ? w - 36 : Math.floor(w / 2) - 24);
  const final = scene.add
    .text(
      18,
      mobile ? 70 : 65,
      `晚上用得上：${endgame}`,
      textStyle(mobile ? 9 : 10, '#9ee8d1', '850'),
    )
    .setWordWrapWidth(w - 36);
  if (!mobile && choice.detail) {
    const detail = scene.add
      .text(w - 14, 10, choice.detail, textStyle(10, '#9ee8d1', '900'))
      .setOrigin(1, 0)
      .setWordWrapWidth(160)
      .setAlign('right');
    c.add(detail);
  }
  fitText(title, w - (mobile ? 104 : 112), mobile ? 20 : 22, mobile ? 12 : 14, 9);
  fitText(gain, mobile ? w - 36 : Math.floor((w - 42) / 2), mobile ? 17 : 24, mobile ? 9 : 10, 8);
  fitText(risk, mobile ? w - 36 : Math.floor(w / 2) - 24, mobile ? 17 : 24, mobile ? 9 : 10, 8);
  fitText(final, w - 36, mobile ? 16 : 18, mobile ? 9 : 10, 8);
  c.add([bg, stripe, route, title, gain, risk, final]);
  c.setSize(w, h).setInteractive(
    new Phaser.Geom.Rectangle(0, 0, w, h),
    Phaser.Geom.Rectangle.Contains,
  );
  c.on('pointerover', () => c.setScale(1.01));
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.985, scaleY: 0.985, yoyo: true, duration: 70 });
    onClick();
  });
  return c;
}

function makeManagementHintCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  hint: ManagementHint,
  mobile: boolean,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(221);
  c.add(
    scene.add
      .rectangle(0, 0, w, h, 0x15383a, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6fd2be, 0.55),
  );
  c.add(scene.add.rectangle(0, 0, 5, h, 0x6fd2be, 0.95).setOrigin(0, 0));
  const text = scene.add
    .text(
      12,
      5,
      `${hint.ledger}\n${hint.gap} · ${hint.recommendation}`,
      textStyle(mobile ? 9 : 10, '#dbfff4', '850'),
    )
    .setLineSpacing(1)
    .setWordWrapWidth(w - 22);
  fitText(text, w - 22, h - 8, mobile ? 9 : 10, 7);
  c.add(text);
  return c;
}

function dialogManagementHint(
  title: string,
  state: PrologueState,
  choices: DialogChoice[],
): ManagementHint | undefined {
  if (!choices.some((choice) => choice.forecast)) return undefined;
  const chosen = recommendedChoice(state, choices);
  const prep = state.preps.length
    ? state.preps.map(prepLabel).slice(0, 2).join('、')
    : '没练收费说法';
  const debt = state.debts.length
    ? state.debts.map(debtLabel).slice(0, 2).join('、')
    : '暂无遗留问题';
  return {
    ledger: `今日账本：行动 ${state.timeLeft}/${STARTING_TIME} · 资料 ${state.clues.length} · 准备 ${state.preps.length} · 遗留 ${state.debts.length}`,
    gap: managementGapLine(state, title),
    recommendation: chosen
      ? `建议：${shortChoiceLabel(chosen.label)}，${shortReason(
          choiceManagementRecommendation(chosen, state),
        )}`
      : '建议：按你想要的结局补强，别把行动全花在同一路线上。',
    finalUse: `终幕带入：${prep} / ${debt}`,
  };
}

function shouldShowManagementHint(title: string, choices: DialogChoice[]): boolean {
  return /资料|准备/.test(title) || choices.some((choice) => actionForecastCost(choice) === '1行动');
}

function actionForecastCost(choice: DialogChoice): string {
  const source = `${choice.detail || ''} ${choice.forecast?.risk || ''}`;
  if (/花\s*1\s*(?:时间|行动)/.test(source)) return '1行动';
  return '0行动';
}

function choiceManagementRecommendation(
  choice: DialogChoice,
  state: PrologueState,
): string {
  const route = choice.forecast?.route;
  if (state.timeLeft <= 1 && actionForecastCost(choice) === '1行动') {
    return '只剩最后一步，选它就是放弃别的资料或准备。';
  }
  if (route === '报价') {
    if (
      state.debts.includes('pricing-limbo') ||
      state.debts.includes('budget-blame') ||
      state.metrics.cash < 700
    ) {
      return '钱还没站住，先让收费有证据和入口。';
    }
    return '适合走收钱路线，终幕预算更稳。';
  }
  if (route === '补偿') {
    if (state.debts.includes('compensation-habit') || state.metrics.trust < 58) {
      return '关系有风险，补一次要锁成小范围试点。';
    }
    return '适合保关系，但别让补偿变成无限续杯。';
  }
  if (route === '边界') {
    if (
      state.debts.includes('full-launch') ||
      state.debts.includes('overpromise') ||
      state.metrics.boundary < 68
    ) {
      return '范围正在变大，先写清能做、不能做、加钱做。';
    }
    return '适合压住顺手加需求，终幕更不容易失控。';
  }
  if (route === '拉倒') return '适合守底线，但要准备好证据和台阶。';
  if (route === '冒险') return '能让场面好看，但会把压力留到终幕。';
  return '适合先稳住人，但后面必须补钱和边界。';
}

function recommendedChoice(
  state: PrologueState,
  choices: DialogChoice[],
): DialogChoice | undefined {
  return choices
    .filter((choice) => choice.forecast)
    .map((choice) => ({ choice, score: choicePriorityScore(choice, state) }))
    .sort((a, b) => b.score - a.score)[0]?.choice;
}

function choicePriorityScore(choice: DialogChoice, state: PrologueState): number {
  const route = choice.forecast?.route;
  let score = 0;
  if (actionForecastCost(choice) === '1行动' && state.timeLeft <= 0) score -= 20;
  if (state.metrics.cash < 700 && route === '报价') score += 4;
  if (state.metrics.trust < 58 && (route === '补偿' || route === '稳住')) score += 3;
  if (state.metrics.boundary < 68 && (route === '边界' || route === '拉倒')) score += 4;
  if (
    (state.debts.includes('pricing-limbo') || state.debts.includes('budget-blame')) &&
    route === '报价'
  ) {
    score += 5;
  }
  if (
    (state.debts.includes('full-launch') || state.debts.includes('overpromise')) &&
    (route === '边界' || route === '补偿')
  ) {
    score += 5;
  }
  if (
    state.debts.includes('compensation-habit') &&
    (route === '边界' || route === '拉倒')
  ) {
    score += 4;
  }
  if (state.debts.includes('relationship-cold') && route === '补偿') score += 4;
  return score;
}

function managementGapLine(state: PrologueState, title: string): string {
  if (state.timeLeft <= 0 && /资料|准备/.test(title)) {
    return '当前缺口：行动用完，只能带着现有资料上桌。';
  }
  const gaps: string[] = [];
  if (
    state.metrics.cash < 700 ||
    state.debts.includes('pricing-limbo') ||
    state.debts.includes('budget-blame')
  ) {
    gaps.push('钱要有名');
  }
  if (state.metrics.trust < 58 || state.debts.includes('relationship-cold')) {
    gaps.push('关系别断');
  }
  if (
    state.metrics.boundary < 68 ||
    state.debts.includes('full-launch') ||
    state.debts.includes('overpromise') ||
    state.debts.includes('compensation-habit')
  ) {
    gaps.push('范围写清');
  }
  if (state.timeLeft <= 2 && /资料|准备/.test(title)) gaps.push('行动紧张');
  return `当前缺口：${gaps.slice(0, 3).join(' / ') || '按想要的结局补强'}`;
}

function shortChoiceLabel(label: string): string {
  return label.replace(/^.*?：/, '').replace(/\s+/g, '').slice(0, 12);
}

function shortReason(text: string): string {
  return text.split(/[，。]/)[0].slice(0, 18);
}

function choiceSpeechLine(choice: DialogChoice): string {
  const label = choice.label.replace(/\s+/g, ' ').trim();
  if (!choice.forecast) return label;
  const route = choice.forecast.route;
  if (label.includes('：')) {
    const [lead, rest] = label.split('：');
    if (route === '报价') return `${lead}，${rest}`;
    if (route === '补偿') return `${lead}，但${rest}`;
    if (route === '边界') return `${lead}，${rest}`;
    if (route === '拉倒') return `${lead}，${rest}`;
    return `${lead}，${rest}`;
  }
  if (route === '报价') return `${label}，先把钱怎么收说清`;
  if (route === '补偿') return `${label}，但先写小范围`;
  if (route === '边界') return `${label}，先把能做不能做写清`;
  if (route === '拉倒') return `${label}，不签范围就先停`;
  if (route === '冒险') return `${label}，我先接住场面`;
  return `${label}，先稳住再说`;
}

function actionRouteColor(route: ActionForecast['route']): number {
  if (route === '报价') return 0xc98035;
  if (route === '补偿') return 0x2d8f73;
  if (route === '边界') return 0x3d6fa5;
  if (route === '拉倒') return 0x8a4e75;
  if (route === '冒险') return 0xe26b4d;
  return 0x2d83a5;
}

function routeEndgameLine(
  route?: ActionForecast['route'],
  override?: string,
): string {
  if (override) return override;
  if (route === '报价') return '预算开局更稳，但客户怒气可能抬头。';
  if (route === '补偿') return '信任更稳，但后面更容易被要求顺手多做。';
  if (route === '边界') return '范围更容易压住，关系会冷一点。';
  if (route === '拉倒') return '边界最高，关系最脆。';
  if (route === '冒险') return '短期好看，终幕压力更高。';
  return '关系先稳，价格问题会被留到后面。';
}

function colorTextBg(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
  color = 0x28566a,
  fontSize = 12,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(220);
  const bg = scene.add
    .rectangle(0, 0, w, h, color, 0.98)
    .setOrigin(0, 0)
    .setStrokeStyle(1, 0xffdf86, 0.78);
  const text = scene.add
    .text(w / 2, h / 2, label, textStyle(fontSize, '#fff8dc', '950'))
    .setOrigin(0.5)
    .setAlign('center')
    .setLineSpacing(3)
    .setWordWrapWidth(w - 12);
  fitText(text, w - 12, h - 8, fontSize, 8);
  c.add([bg, text]);
  c.setSize(w, h).setInteractive(
    new Phaser.Geom.Rectangle(0, 0, w, h),
    Phaser.Geom.Rectangle.Contains,
  );
  c.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.97, scaleY: 0.97, yoyo: true, duration: 70 });
    onClick();
  });
  return c;
}

function fitText(
  text: Phaser.GameObjects.Text,
  maxW: number,
  maxH: number,
  start: number,
  min: number,
): void {
  let size = start;
  while ((text.width > maxW || text.height > maxH) && size > min) {
    size -= 1;
    text.setFontSize(size);
  }
}

function wrapCjk(text: string, maxChars: number): string {
  return text
    .split('\n')
    .map((line) => {
      if (line.length <= maxChars) return line;
      const chunks: string[] = [];
      let rest = line;
      while (rest.length > maxChars) {
        let cut = maxChars;
        const window = rest.slice(0, maxChars + 1);
        const breakAt = Math.max(
          window.lastIndexOf('，'),
          window.lastIndexOf('。'),
          window.lastIndexOf('：'),
          window.lastIndexOf(' / '),
          window.lastIndexOf(' '),
        );
        if (breakAt >= Math.max(6, maxChars - 6)) cut = breakAt + 1;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      if (rest) chunks.push(rest);
      return chunks.join('\n');
    })
    .join('\n');
}

function outcomeSnapshot(state: PrologueState): OutcomeSnapshot {
  return {
    metrics: { ...state.metrics },
    debts: [...state.debts],
  };
}

function mobileChipLimit(mobile: boolean): number {
  return mobile ? 3 : 6;
}

function shortPlainLine(line: string, max = 38): string {
  const clean = line
    .replace(/^[^：]{2,10}：/, '')
    .replace(/\s+/g, '')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function outcomeSceneChange(summary: string): string {
  return shortPlainLine(summary, 42);
}

function outcomeFinalImpact(
  before: OutcomeSnapshot,
  after: PrologueState,
): string {
  if (after.mode === 'battle') {
    return '前面的选择已经带进终幕，钱、关系、边界会从这里开局。';
  }
  const added = after.debts.filter((id) => !before.debts.includes(id)).map(debtLabel);
  if (added.length) return `留下${added[0]}，终幕客户会抓这点追问。`;
  const removed = before.debts.filter((id) => !after.debts.includes(id)).map(debtLabel);
  if (removed.length) return `清掉${removed[0]}，终幕少一块压力。`;
  const metrics = metricDeltaParts(before.metrics, after.metrics);
  if (metrics.length) return `${metrics[0]}，终幕开局会更偏这条路线。`;
  return '局面变清楚，终幕少一点乱答应。';
}

function metricDeltaParts(before: Metrics, after: Metrics): string[] {
  const labels: Record<keyof Metrics, [string, string]> = {
    cash: ['钱先有名', '现金让步'],
    trust: ['关系稳住', '关系变冷'],
    patience: ['耐心回一口', '耐心被耗'],
    boundary: ['边界更清楚', '边界松了'],
    pressure: ['压力升温', '压力降下来'],
  };
  return (Object.keys(labels) as Array<keyof Metrics>)
    .map((key) => {
      const diff = Math.round(after[key] - before[key]);
      if (!diff) return '';
      const [positive, negative] = labels[key];
      const label = diff > 0 ? positive : negative;
      return `${label} ${diff > 0 ? '+' : ''}${diff}`;
    })
    .filter(Boolean);
}

function debtDiffSummary(before: DebtId[], after: DebtId[]): string {
  const added = after.filter((id) => !before.includes(id)).map(debtLabel);
  const removed = before.filter((id) => !after.includes(id)).map(debtLabel);
  const parts = [
    added.length ? `新增 ${added.join('、')}` : '',
    removed.length ? `清理 ${removed.join('、')}` : '',
  ].filter(Boolean);
  return `遗留问题变化：${parts.join('；') || '暂无'}\n当前遗留问题：${
    after.map(debtLabel).join(' / ') || '暂无'
  }`;
}

function debtDeltaParts(before: DebtId[], after: DebtId[]): string[] {
  const summary = debtDiffSummary(before, after);
  if (summary.includes('遗留问题变化：暂无')) return [];
  const added = after.filter((id) => !before.includes(id)).map(debtLabel);
  const removed = before.filter((id) => !after.includes(id)).map(debtLabel);
  return [
    ...added.map((label) => `新增 ${label}`),
    ...removed.map((label) => `清理 ${label}`),
  ];
}

function decisionVignette(decision: string, fallback: string): DecisionVignette {
  const table: Record<string, DecisionVignette> = {
    'opening:finance': {
      speaker: 'finance',
      title: '第一句话先回财务',
      boLine: '钱先不能糊，GPU 账单我来拆，免费和正式服务分开算。',
      replyLine: '财务姐把截图钉在桌上：行，那你别只会讲云，先讲钱怎么收。',
    },
    'opening:boss': {
      speaker: 'boss',
      title: '第一句话先回老板',
      boLine: '今天能上线试点，但不能把全部上线先吹出去。',
      replyLine: '老板回了一个“懂”，财务群却还在追问：那账单谁认？',
    },
    'opening:customer': {
      speaker: 'customer',
      title: '第一句话先回客户',
      boLine: '我先听你把问题说完，能梳，但要把范围讲清。',
      replyLine: '客户姐没挂语音，关系稳住了。只是“免费”两个字还没被拿下桌。',
    },
    'finance:quote': {
      speaker: 'finance',
      title: '账单被拆成能收的钱',
      boLine: '这不是一句“云很贵”，是基础包、加急包、跟进包三张单。',
      replyLine: '财务姐把截图收回去：可以，至少这次不是让成本自己蒸发。',
    },
    'finance:empathy': {
      speaker: 'finance',
      title: '先稳住账单恐慌',
      boLine: '账单确实吓人，我先把它拆明白，再讲怎么收。',
      replyLine: '财务姐点头，但笔没放下：同情可以，价格不能悬着。',
    },
    'ledger:sort': {
      speaker: 'finance',
      title: '账单被拆成三格',
      boLine: 'GPU 峰值算加急服务，试用结束进基础包，免费额度写上限。',
      replyLine: '财务姐把笔放慢了一点：这下不是空口收钱，是有桌面证据。',
    },
    'financeAudit:paid-pilot': {
      speaker: 'finance',
      title: '试用被改成收费试点',
      boLine: '试用到这里封口，下一段按收费试点走。',
      replyLine: '财务姐终于有了回复老板的表：钱先有名字，再谈人情。',
    },
    'financeAudit:free-cap': {
      speaker: 'finance',
      title: '免费额度被写上上限',
      boLine: '可以给一次台阶，但额度以外就不是顺手，是新服务。',
      replyLine: '财务姐皱眉：这次我记你有人情，下次别拿我当钱包。',
    },
    'financeAudit:self-bear': {
      speaker: 'finance',
      title: '锅先背在博哥身上',
      boLine: '先别让客户掉线，我晚上把账补齐。',
      replyLine: '财务姐没反对，但截图还亮着：你这是把白天拖成晚上。',
    },
    'boss:scope': {
      speaker: 'boss',
      title: '上线说法先写边界',
      boLine: '今天能说上线，但得先写清验收说法。',
      replyLine: '老板要体面，博哥要活路。会议室里第一次出现了边界两个字。',
    },
    'boss:poc': {
      speaker: 'boss',
      title: '今天上线被改成试点上线',
      boLine: '今天交付小范围试点，不承诺全部上线。',
      replyLine: '老板看起来没那么爽，但这句话晚上能经得住客户追问。',
    },
    'boss:hard': {
      speaker: 'boss',
      title: '硬接全部上线',
      boLine: '我接，但要把风险先记下来。',
      replyLine: '老板满意了，压力也落到博哥肩上：漂亮话开始变贵。',
    },
    'bossRehearsal:poc-script': {
      speaker: 'boss',
      title: '试点台词彩排成功',
      boLine: '我会说“今天交付试点”，不说“今天全部上线”。',
      replyLine: '老板把这句话念了一遍，终于像人话，也像能落地的话。',
    },
    'bossRehearsal:rollback': {
      speaker: 'boss',
      title: '失败退路进了桌面',
      boLine: '能上线，也能回滚。退路写着，别靠临场硬扛。',
      replyLine: '老板沉默两秒：不够燃，但够稳。',
    },
    'bossRehearsal:overpromise': {
      speaker: 'boss',
      title: '场面话说满了',
      boLine: '下午我给客户一个够大的说法。',
      replyLine: '老板高兴，白板发烫。博哥知道这句话晚上会回来找他。',
    },
    'customer:quote': {
      speaker: 'customer',
      title: '报价先上桌',
      boLine: '能再梳，但先把基础服务和加急服务分开算。',
      replyLine: '客户姐笑了一下：你这人，终于开始谈钱了。',
    },
    'customer:compensate': {
      speaker: 'customer',
      title: '补一次，但不补全世界',
      boLine: '我可以再梳一次，但这次叫小范围试点。',
      replyLine: '客户姐没走，问题也没小：那就顺手全部上线呗？',
    },
    'customer:walkaway': {
      speaker: 'customer',
      title: '拉倒先放到桌上',
      boLine: '范围不签，就先体面拉倒，别把今天拖成免费长跑。',
      replyLine: '客户姐脸色冷了一点，但也知道博哥不是无限续杯。',
    },
    'customerReversal:quote-table': {
      speaker: 'customer',
      title: '顺手两个字被报价拆开',
      boLine: '顺手可以，但顺手全部上线就是另一张报价表。',
      replyLine: '客户姐盯着表：行，那你先说这钱咋收。',
    },
    'customerReversal:poc-only': {
      speaker: 'customer',
      title: '补偿被锁进试点',
      boLine: '补一次只补小范围试点，不补全部上线。',
      replyLine: '客户姐把语音停了：这话听着抠，但至少讲清楚了。',
    },
    'customerReversal:walkaway-line': {
      speaker: 'customer',
      title: '拉倒变成退场机制',
      boLine: '不签范围就先停，证据、台阶、后续报价我都留着。',
      replyLine: '客户姐没立刻拍桌，说明这句难听话还有用。',
    },
    'prep:pricing-rehearsal': {
      speaker: 'system',
      title: '收费说法练顺了',
      boLine: '基础包、加急包、跟进包，先念顺，别上桌才发明。',
      replyLine: '准备桌亮起一格：下午报价不会像临时加钱。',
    },
    'prep:poc-demo': {
      speaker: 'system',
      title: '试点演示被圈小',
      boLine: '演示只走小范围试点路径，回滚按钮别藏。',
      replyLine: '准备桌亮起一格：补一次不会自动长成全部上线。',
    },
    'prep:walkaway-script': {
      speaker: 'system',
      title: '拉倒台阶写好了',
      boLine: '已交付、未承诺、后续报价，三句话说完再停。',
      replyLine: '准备桌亮起一格：退场不再像摔门。',
    },
  };
  return (
    table[decision] || {
      speaker: 'system',
      title: decisionLabel(decision),
      boLine: fallback,
      replyLine: '今天的局面往前推了一格，下午谈判会记住这一步。',
    }
  );
}

function addDebt(state: PrologueState, id: DebtId): void {
  if (state.debts.includes(id)) return;
  state.debts.push(id);
  state.log.unshift(`遗留问题生成：${DEBTS[id].label}。${DEBTS[id].line}`);
}

function removeDebt(state: PrologueState, id: DebtId): void {
  if (!state.debts.includes(id)) return;
  state.debts = state.debts.filter((item) => item !== id);
  state.log.unshift(`遗留问题清理：${DEBTS[id].label} 被压住了。`);
}

function debtLabel(id: DebtId): string {
  return DEBTS[id]?.label || id;
}

function prepLabel(id: PrepId): string {
  return (
    PREP_OPTIONS.find((option) => option.id === id)?.label ||
    {
      'pricing-rehearsal': '演练收费说法',
      'poc-demo': '跑一遍小范围试点演示',
      'walkaway-script': '写拉倒台阶',
    }[id]
  );
}

function prepForecast(option: PrepOption): ActionForecast {
  if (option.id === 'pricing-rehearsal') {
    return {
      route: '报价',
      gain: '练收费说法，终幕报价更像服务，不像临时加钱。',
      risk: '花 1 行动，少查一张资料。',
      endgame: '克制预算质疑，报价上桌额外加预算和信任。',
    };
  }
  if (option.id === 'poc-demo') {
    return {
      route: '补偿',
      gain: '把免费补一次锁成小范围试点，关系更稳。',
      risk: '花 1 行动，老板可能觉得没那么体面。',
      endgame: '克制顺手加范围，补一次不会把需求越喂越大。',
    };
  }
  return {
    route: '拉倒',
    gain: '先写退场台阶，拉倒时不显得摔门。',
    risk: '花 1 行动，耐心会少一点。',
    endgame: '克制不签范围的僵局，体面拉倒更能压住需求和怒气。',
  };
}

function evidenceForecast(option: EvidenceOption): ActionForecast {
  if (option.id === 'ledger:gpu-peak') {
    return {
      route: '报价',
      gain: '拿到 GPU 峰值曲线，报价不是凭感觉喊价。',
      risk: '花 1 行动，少练一次话术。',
      endgame: '终幕报价时预算更稳，客户更难说这单该免费。',
    };
  }
  if (option.id === 'ledger:trial-to-paid') {
    return {
      route: '报价',
      gain: '把试用转正式跟进，钱有入口。',
      risk: '客户会觉得关系变硬一点。',
      endgame: '终幕更容易把免费跟进拆成基础包和加急包。',
    };
  }
  if (option.id === 'ledger:free-cap') {
    return {
      route: '边界',
      gain: '免费额度写清，关系还有台阶。',
      risk: '钱会少一点，换来边界。',
      endgame: '终幕客户再问免费，博哥能说清哪里到头。',
    };
  }
  if (option.id === 'whiteboard:poc-acceptance') {
    return {
      route: '补偿',
      gain: '把今天上线改成小范围试点，信任更稳。',
      risk: '花 1 行动，少查一张账单。',
      endgame: '终幕补一次时，客户更容易接受试点验收。',
    };
  }
  if (option.id === 'whiteboard:rollback') {
    return {
      route: '边界',
      gain: '失败退路写清，老板体面，博哥也有后路。',
      risk: '耐心会被彩排消耗一点。',
      endgame: '终幕范围变大时，退路能压住追责。',
    };
  }
  if (option.id === 'whiteboard:boss-script') {
    return {
      route: '冒险',
      gain: '老板说法更体面，钱也更好开口。',
      risk: '话说漂亮了，客户可能追得更紧。',
      endgame: '终幕开局更有气势，但需求压力会高一点。',
    };
  }
  if (option.id === 'contract:three-column') {
    return {
      route: '边界',
      gain: '能做、不能做、加钱做写清楚。',
      risk: '客户可能觉得没那么热情。',
      endgame: '终幕需求变多时，范围更容易压住。',
    };
  }
  if (option.id === 'contract:comp-cap') {
    return {
      route: '补偿',
      gain: '补偿有上限，关系和边界都能保一点。',
      risk: '要花一点钱买台阶。',
      endgame: '终幕补一次不会被说成无限续杯。',
    };
  }
  return {
    route: '拉倒',
    gain: '把已交付和未承诺留下证据，退场不靠吵。',
    risk: '花 1 行动，少补一张别的资料。',
    endgame: '终幕拉倒时更体面，边界更稳。',
  };
}

function prepSummary(state: PrologueState): string {
  if (!state.preps.length) return '战前准备：暂无';
  return `战前准备：${state.preps.map(prepLabel).join(' / ')}`;
}

function addMilestoneForBeat(state: PrologueState, beat: Beat): boolean {
  const milestone = BEAT_MILESTONE[beat];
  if (!milestone || state.milestones.includes(milestone)) return false;
  state.milestones.push(milestone);
  state.log.unshift(`章节推进：${MILESTONES[milestone].label}。${MILESTONES[milestone].line}`);
  return true;
}

function normalizeMilestones(input: unknown): MilestoneId[] {
  const milestones = Array.isArray(input)
    ? input
        .filter((item): item is MilestoneId =>
          Object.prototype.hasOwnProperty.call(MILESTONES, String(item)),
        )
        .slice(0, 6)
    : [];
  return milestones.length ? milestones : ['open'];
}

function milestoneSummary(state: PrologueState, compact = false): string {
  const milestones: MilestoneId[] = state.milestones.length
    ? state.milestones
    : ['open'];
  const labels = milestones.map((id) => MILESTONES[id]?.label || id);
  if (compact) return labels.join(' -> ');
  return `${labels.join(' -> ')}\n章节复盘：${milestones
    .map((id) => MILESTONES[id]?.line || id)
    .join('；')}`;
}

function storyCausalChain(state: PrologueState): string[] {
  const has = (id: string) => state.decisions.includes(id);
  const opening = has('opening:finance')
    ? '开场：先回财务，钱不能糊'
    : has('opening:boss')
      ? '开场：先回老板，上线别吹满'
      : has('opening:customer')
        ? '开场：先回客户，范围要讲清'
        : '开场：三条消息还没回';
  const finance = has('financeAudit:self-bear')
    ? '钱：博哥先扛，预算追问会回来'
    : has('financeAudit:free-cap')
      ? '钱：免费有上限，关系稳一点'
      : has('financeAudit:paid-pilot') || has('finance:quote')
        ? '钱：报价上桌，终幕预算更稳'
        : has('finance:empathy')
          ? '钱：先稳住，价格还悬着'
          : '钱：账单还没拆清';
  const launch = has('bossRehearsal:overpromise') || has('boss:hard')
    ? '上线：话说满，范围会反扑'
    : has('bossRehearsal:rollback')
      ? '上线：留失败退路，追责有台阶'
      : has('boss:poc') || has('bossRehearsal:poc-script') || has('boss:scope')
        ? '上线：只承诺小范围试点'
        : '上线：老板那边还没定';
  const customer = has('customerReversal:walkaway-line') || has('customer:walkaway')
    ? '客户：拉倒有台阶，关系会冷'
    : has('customerReversal:poc-only') || has('customer:compensate')
      ? '客户：补一次锁进小范围试点'
      : has('customerReversal:quote-table') || has('customer:quote')
        ? '客户：顺手被报价拆开'
        : '客户：免费再来一次还没接';
  const ending = state.mode === 'ending'
    ? `结局：${routeReport(state).title}`
    : state.mode === 'battle' && state.battle
      ? `终幕：第 ${state.battle.round}/9 回合，${PHASES[state.battle.phase]?.title || '复盘'}`
      : '终幕：还没上谈判桌';
  return [opening, finance, launch, customer, ending];
}

function storyCausalLine(state: PrologueState, compact = false): string {
  const chain = storyCausalChain(state);
  if (compact) return chain.map((part) => part.replace(/^.{1,3}：/, '')).join(' -> ');
  return chain.join(' -> ');
}

function timeSpendSummary(state: PrologueState): string {
  if (!state.timeLog.length) return '暂无，今天还没花准备行动';
  return state.timeLog.join(' / ');
}

function prepWorkbenchCards(state: PrologueState): PrepWorkbenchCard[] {
  return PREP_OPTIONS.map((option) => {
    const forecast = prepForecast(option);
    return {
      id: option.id,
      label: option.label,
      route: forecast.route,
      line: option.line,
      gain: forecast.gain,
      risk: forecast.risk,
      prepared: state.preps.includes(option.id),
    };
  });
}

function ledgerSortDecision(id: LedgerSortItem['id']): string {
  return `ledger:sort:${id}`;
}

function ledgerSortedIds(state: PrologueState): LedgerSortItem['id'][] {
  return LEDGER_SORT_ITEMS.filter((item) =>
    state.decisions.includes(ledgerSortDecision(item.id)),
  ).map((item) => item.id);
}

function ledgerSortSlots(state: PrologueState): LedgerSortSlot[] {
  const done = ledgerSortedIds(state);
  return LEDGER_SORT_ITEMS.map((item) => ({
    id: item.id,
    target: item.target,
    label:
      item.id === 'gpu'
        ? '加急算力和跟进服务'
        : item.id === 'trial'
          ? '试用之后的正式跟进'
          : '免费台阶的上限',
    placed: done.includes(item.id),
  }));
}

function ledgerSortingComplete(state: PrologueState): boolean {
  return ledgerSortedIds(state).length >= LEDGER_SORT_ITEMS.length;
}

function battleReadinessSummary(state: PrologueState): {
  ready: boolean;
  materialCount: number;
  missing: string[];
  line: string;
} {
  const materialCount = state.clues.length + state.preps.length;
  const hasEvidence = state.clues.length > 0;
  const hasPrep = state.preps.length > 0;
  const missing = [
    hasEvidence ? '' : '缺少资料：至少查一张账单、验收白板或范围单。',
    hasPrep ? '' : '缺少准备：至少在战前准备桌练一次收费、试点或拉倒。',
  ].filter(Boolean);
  const ready = materialCount > 0;
  return {
    ready,
    materialCount,
    missing: missing.length ? missing : ['资料或准备已有，能带东西上桌。'],
    line: ready
      ? `上桌材料 ${materialCount} 项：资料 ${state.clues.length} / 准备 ${state.preps.length}`
      : '空手上桌：没有资料也没有准备，谈判会从高风险开局。',
  };
}

function needsBattleReadinessGate(state: PrologueState): boolean {
  return !battleReadinessSummary(state).ready;
}

function debtSummary(state: PrologueState, compact = false): string {
  if (!state.debts.length) return '遗留问题：暂无';
  const labels = state.debts.map(debtLabel);
  if (compact) return `遗留问题：${labels.slice(0, 3).join(' / ')}`;
  return `遗留问题：${labels.join(' / ')}\n问题影响：${state.debts
    .map((id) => DEBTS[id].line)
    .join('；')}`;
}

function battleDossierLines(state: PrologueState): string[] {
  const finance = zoneOutcomeLabel('finance', state);
  const boss = zoneOutcomeLabel('boss', state);
  const customer = zoneOutcomeLabel('customer', state);
  const prep = state.preps.length
    ? state.preps.map(prepLabel).slice(0, 2).join('、')
    : '没练话术';
  const debt = state.debts.length
    ? state.debts.map(debtLabel).slice(0, 2).join('、')
    : '暂无遗留问题';
  return [
    `财务：${finance}，账单要能收钱。`,
    `老板：${boss}，上线话不能吹破。`,
    `客户：${customer}，再梳一次要有边界。`,
    `上桌：资料 ${state.clues.length} 张 / ${prep} / ${debt}`,
  ];
}

function battleDebtImpact(debts: DebtId[]): BattleClient {
  return debts.reduce(
    (sum, id) => {
      const impact = DEBTS[id]?.battle || {};
      sum.anger += impact.anger || 0;
      sum.budget += impact.budget || 0;
      sum.scope += impact.scope || 0;
      sum.trust += impact.trust || 0;
      return sum;
    },
    { anger: 0, budget: 0, scope: 0, trust: 0 },
  );
}

function decisionLabel(id: string): string {
  return (
    {
      'opening:finance': '开场：先回财务',
      'opening:boss': '开场：先回老板',
      'opening:customer': '开场：先回客户',
      'ledger:sort': '账单白板：拆成三格',
      'ledger:sort:gpu': '账单拆包：GPU 峰值',
      'ledger:sort:trial': '账单拆包：试用额度',
      'ledger:sort:free': '账单拆包：免费上限',
      'finance:quote': '财务：拆包收费',
      'finance:empathy': '财务：先稳情绪',
      'financeAudit:paid-pilot': '财务追问：收费试点',
      'financeAudit:free-cap': '财务追问：免费上限',
      'financeAudit:self-bear': '财务追问：博哥先扛',
      'boss:scope': '老板：验收说法',
      'boss:poc': '老板：只承诺小范围试点',
      'boss:hard': '老板：硬接全部上线',
      'bossRehearsal:poc-script': '彩排：小范围试点台词',
      'bossRehearsal:rollback': '彩排：失败退路',
      'bossRehearsal:overpromise': '彩排：话说满',
      'customer:quote': '客户：先报价',
      'customer:compensate': '客户：补一次',
      'customer:walkaway': '客户：先拉倒',
      'customerReversal:quote-table': '反悔：报价表开谈',
      'customerReversal:poc-only': '反悔：只补小范围试点',
      'customerReversal:walkaway-line': '反悔：拉倒台阶',
      'prep:pricing-rehearsal': '准备：收费说法',
      'prep:poc-demo': '准备：小范围试点演示',
      'prep:walkaway-script': '准备：拉倒台阶',
    }[id] || id
  );
}

function evidenceSummary(state: PrologueState, compact = false): string {
  if (!state.clues.length) return '资料线索：暂无';
  const core = state.clues.filter((item) =>
    ['成本三列表', '验收三句话', '范围单模板'].includes(item),
  );
  const cards = state.clues.filter((item) => !core.includes(item));
  const visible = compact ? cards.slice(-4) : cards.slice(0, 9);
  const extra = cards.length > visible.length ? ` 等 ${cards.length} 张` : '';
  return `资料线索：${core.join(' / ') || '基础线索未齐'}\n资料卡：${
    visible.join(' / ') || '暂无'
  }${extra}`;
}

function routeReport(state: PrologueState): RouteReport {
  const cashScore = state.metrics.cash >= 760 ? '收钱 S' : state.metrics.cash >= 620 ? '收钱 A' : '收钱 C';
  const boundaryScore =
    state.metrics.boundary >= 90
      ? '边界 S'
      : state.metrics.boundary >= 70
        ? '边界 A'
        : '边界 C';
  const relationScore =
    state.metrics.trust >= 72
      ? '关系 S'
      : state.metrics.trust >= 56
        ? '关系 A'
        : '关系 C';
  const debtScore = state.debts.length === 0 ? '遗留问题 S' : state.debts.length <= 2 ? '遗留问题 B' : '遗留问题 D';
  const common = {
    paid: {
      title: '报价上桌型售后王',
      advice: '下轮可以少一点现金冲刺，多压低遗留问题，让钱和关系一起稳。',
    },
    'bounded-comp': {
      title: '有限补偿型产品经理',
      advice: '补一次已经写进范围，下轮试试更早报价，别让客户把小范围试点当一直免费。',
    },
    'clean-walkaway': {
      title: '边界合同人',
      advice: '拉倒路线稳住了体面，下轮可以提前铺报价证据，争取体面和成交都拿。',
    },
    'poc-limbo': {
      title: '小范围试点还没定者',
      advice: '下轮优先补齐成本表和验收句，别把明天也变成解释会。',
    },
    'free-burnout': {
      title: '免费售后受害者',
      advice: '下轮先立价格和范围，少用情分硬顶，耐心不是无限云资源。',
    },
    '': {
      title: '今日未收工',
      advice: '先把今天打完。',
    },
  }[state.ending];
  const grade =
    state.ending === 'free-burnout'
      ? 'D'
      : state.debts.length === 0 && state.metrics.cash >= 700
        ? 'S'
        : state.metrics.boundary >= 80 && state.metrics.trust >= 60
          ? 'A'
          : 'B';
  return {
    title: common.title,
    grade: `评级 ${grade}`,
    scores: [cashScore, boundaryScore, relationScore, debtScore],
    advice: common.advice,
  };
}

function endingEchoes(state: PrologueState): EndingEcho[] {
  const ending = state.ending;
  if (ending === 'paid') {
    return [
      { speaker: 'finance', line: '基础包能入账，情分不能付款。' },
      { speaker: 'boss', line: '上线说法能播，试点没有吹破。' },
      { speaker: 'customer', line: '再梳一次可以，加急得有价。' },
      { speaker: 'bo', line: '钱收到，关系没碎，明天补边界。' },
    ];
  }
  if (ending === 'bounded-comp') {
    return [
      { speaker: 'finance', line: '免费额度有上限，这账还能解释。' },
      { speaker: 'boss', line: '客户没翻桌，试点没有吹破。' },
      { speaker: 'customer', line: '再梳一次可以，范围别藏。' },
      { speaker: 'bo', line: '补偿保关系，下轮早点报价。' },
    ];
  }
  if (ending === 'clean-walkaway') {
    return [
      { speaker: 'finance', line: '没成交也行，别继续免费烧。' },
      { speaker: 'boss', line: '话难听，但锅没签回来。' },
      { speaker: 'customer', line: '先停可以，后面按范围谈。' },
      { speaker: 'bo', line: '拉倒不是摔门，是留台阶。' },
    ];
  }
  if (ending === 'poc-limbo') {
    return [
      { speaker: 'finance', line: '试点先挂着，明天补收费依据。' },
      { speaker: 'boss', line: '客户没走，上线话还得再磨。' },
      { speaker: 'customer', line: '我先看试点，别又说半天不落地。' },
      { speaker: 'bo', line: '今天没死，明天别空手上桌。' },
    ];
  }
  if (ending === 'free-burnout') {
    return [
      { speaker: 'finance', line: '钱没收上来，资源还在烧。' },
      { speaker: 'boss', line: '今天不体面，明天先补范围。' },
      { speaker: 'customer', line: '你说再梳一次，我就当还能继续。' },
      { speaker: 'bo', line: '情分顶不住账单，先说钱和范围。' },
    ];
  }
  return [
    { speaker: 'finance', line: '先把账说清。' },
    { speaker: 'boss', line: '上线话别说满。' },
    { speaker: 'customer', line: '再梳一次也要讲明白。' },
    { speaker: 'bo', line: '第一天还没收工。' },
  ];
}

function endingClosingSceneLine(state: PrologueState, report: RouteReport): string {
  const debt =
    state.debts.length > 0
      ? `还剩 ${state.debts.map(debtLabel).slice(0, 2).join('、')}`
      : '遗留问题清零';
  if (state.ending === 'paid')
    return `会议室灯暗下来，${report.title}把账单推回桌面。钱收上来了，${debt}，明天要补边界。`;
  if (state.ending === 'bounded-comp')
    return `范围单压住免费要求，客户带着小范围试点离开。关系保住了，${debt}，下轮先报价。`;
  if (state.ending === 'clean-walkaway')
    return `博哥没有摔门，只把暂停写进记录。没乱补、没乱签，${debt}，后面按范围再谈。`;
  if (state.ending === 'poc-limbo')
    return `试点记录夹在账单和范围单之间，今天没有崩，但钱和话还没完全落地。${debt}。`;
  if (state.ending === 'free-burnout')
    return `桌上只剩没收回来的账单。博哥知道问题不在多服务一次，而在没先把钱怎么收说清。${debt}。`;
  return `会议室还没收工，账单、范围单和试点记录都等博哥补一句清楚话。${debt}。`;
}

function beatStep(beat: Beat): number {
  return Math.max(1, BEAT_ORDER.indexOf(beat) + 1);
}

function bridgeForDecision(decision: string, state: PrologueState): BeatBridge | undefined {
  if (decision.startsWith('prep:')) return undefined;
  if (decision.startsWith('ledger:')) return undefined;
  if (state.mode === 'ending') return BEAT_BRIDGES.ending;
  if (state.mode === 'battle') return BEAT_BRIDGES.battle;
  return BEAT_BRIDGES[state.beat];
}

function bridgeStoryboardPanels(
  bridge: BeatBridge,
  state: PrologueState,
): BridgeStoryboardPanel[] {
  const dossier = bridge.nextBeat === 'battle'
    ? battleDossierLines(state)
    : [];
  const nextLine = bridge.nextBeat === 'battle'
    ? `上桌前确认：${dossier[0] || '财务要钱'} ${dossier[1] || '老板要体面'} ${dossier[2] || '客户要再梳一次'}`
    : bridge.nextAction;
  return [
    {
      label: '刚才留下的余波',
      line: bridge.sceneLine,
      color: bridge.accent,
    },
    {
      label: '博哥心里过一遍',
      line: bridge.boLine,
      color: SPEAKERS.bo.color,
    },
    {
      label: bridge.nextBeat === 'battle' ? '上桌前清单' : '下一幕压力',
      line: nextLine,
      color: bridge.nextBeat === 'battle' ? 0xffdf86 : bridge.accent,
    },
  ];
}

function currentGuideTarget(state: PrologueState): GuideTarget | undefined {
  if (state.mode !== 'map') return undefined;
  if (state.beat === 'wake') {
    const desk = HOTSPOTS.find((spot) => spot.id === 'desk');
    if (!desk) return undefined;
    return {
      id: 'desk',
      label: '工位屏幕',
      action: '点一条消息，或走近工位',
      x: desk.x + desk.w / 2,
      y: desk.y + desk.h / 2,
    };
  }
  if (
    state.beat === 'customerReversal' &&
    state.decisions.some((id) => id.startsWith('customerReversal:')) &&
    needsBattleReadinessGate(state)
  ) {
    const briefing = HOTSPOTS.find((spot) => spot.id === 'briefing');
    if (briefing) {
      return {
        id: 'briefing',
        label: '战前准备桌',
        action: '先拿资料或练一句话，再上谈判桌',
        x: briefing.x + briefing.w / 2,
        y: briefing.y + briefing.h / 2,
      };
    }
  }
  const actor = ACTORS.find((item) => item.beat === state.beat);
  if (actor) {
    return {
      id: actor.id,
      label: actor.name,
      action: actor.role,
      x: actor.x,
      y: actor.y,
    };
  }
  const target = STORY_BEATS[state.beat]?.target;
  const spot = HOTSPOTS.find((item) => item.id === target);
  if (!spot) return undefined;
  return {
    id: spot.id,
    label: spot.label,
    action: '处理当前目标',
    x: spot.x + spot.w / 2,
    y: spot.y + spot.h / 2,
  };
}

function directionArrow(dx: number, dy: number): string {
  const horizontal = Math.abs(dx) > 18 ? (dx > 0 ? '→' : '←') : '';
  const vertical = Math.abs(dy) > 18 ? (dy > 0 ? '↓' : '↑') : '';
  return vertical + horizontal || '•';
}

function actorApproachOffset(id: string): { x: number; y: number } {
  return (
    {
      finance: { x: -58, y: 48 },
      boss: { x: -58, y: 48 },
      customer: { x: -58, y: 48 },
    }[id] || { x: -46, y: 34 }
  );
}

function sceneEventColor(tone: SceneEventBubble['tone']): number {
  if (tone === 'money') return 0xc98035;
  if (tone === 'launch') return 0x3d6fa5;
  if (tone === 'customer') return 0x2d8f73;
  if (tone === 'bo') return 0x2d83a5;
  return 0xe26b4d;
}

function setPieceColor(tone: StorySetPiece['tone']): number {
  if (tone === 'money') return 0xc98035;
  if (tone === 'launch') return 0x3d6fa5;
  if (tone === 'customer') return 0x2d8f73;
  return 0xffdf86;
}

function storySetPieceForBeat(beat: Beat): StorySetPiece | undefined {
  if (beat === 'finance') {
    return {
      title: '财务账单墙',
      subtitle: 'GPU 峰值曲线被拍到桌上，今天先把“免费试用”拆成能收费的服务。',
      props: ['GPU 峰值', '试用超额', '收费项目'],
      tone: 'money',
    };
  }
  if (beat === 'financeAudit') {
    return {
      title: '预算归属桌',
      subtitle: '财务不追技术名词，只追谁认钱、认多少、还能白送几次。',
      props: ['预算入口', '免费上限', '别让成本蒸发'],
      tone: 'money',
    };
  }
  if (beat === 'boss') {
    return {
      title: '上线玻璃房',
      subtitle: '老板要体面一句话，博哥要把“今天上线”压成能交付的小范围试点。',
      props: ['今天上线', '验收说法', '别承诺太满'],
      tone: 'launch',
    };
  }
  if (beat === 'bossRehearsal') {
    return {
      title: '上线彩排板',
      subtitle: '试点范围、验收话术、失败退路摆在一起，漂亮话要能活到晚上。',
      props: ['试点范围', '失败退路', '客户能听懂'],
      tone: 'launch',
    };
  }
  if (beat === 'customer') {
    return {
      title: '客户收费桌',
      subtitle: '客户姐一句玩笑把收费、补偿、拉倒全抛上桌，博哥不能只回“可以”。',
      props: ['再梳一次', '先说钱', '别补全世界'],
      tone: 'customer',
    };
  }
  if (beat === 'customerReversal') {
    return {
      title: '范围反转桌',
      subtitle: '“顺手全部上线”开始膨胀，补一次必须被锁回小范围试点。',
      props: ['顺手全部', '范围单', '体面拉倒'],
      tone: 'customer',
    };
  }
  if (beat === 'battle') {
    return {
      title: '收费谈判桌',
      subtitle: '上午所有选择都带上桌，钱、关系、边界至少保住两个。',
      props: ['报价', '补一次', '拉倒'],
      tone: 'briefing',
    };
  }
  return undefined;
}

function visibleStageZones(beat: Beat): StageZone[] {
  const active = activeZoneForBeat(beat);
  const visible = new Set<ZoneId>([active]);
  if (beat === 'customerReversal') visible.add('briefing');
  return STAGE_ZONES.filter((zone) => visible.has(zone.id));
}

function stageBackdropColor(zone: ZoneId): {
  dark: number;
  floor: number;
  grid: number;
  accent: number;
} {
  if (zone === 'finance')
    return { dark: 0x2b2418, floor: 0xefe0b5, grid: 0xb78a45, accent: 0xc98035 };
  if (zone === 'boss')
    return { dark: 0x102033, floor: 0xdce9f1, grid: 0x648ab6, accent: 0x3d6fa5 };
  if (zone === 'customer')
    return { dark: 0x10291f, floor: 0xe5ddbd, grid: 0x69a67d, accent: 0x2d8f73 };
  if (zone === 'briefing')
    return { dark: 0x2a2119, floor: 0xe8d5aa, grid: 0x92733d, accent: 0x7a542d };
  return { dark: 0x102526, floor: 0xe8d8aa, grid: 0x8eb9ab, accent: 0x2d83a5 };
}

function mapStageSnapshot(state: PrologueState): MapStageSnapshot {
  const activeZone = activeZoneForBeat(state.beat);
  return {
    mode: state.beat === 'wake' ? 'opening-pressure-stage' : 'focused-act-stage',
    activeZone,
    visibleZones: visibleStageZones(state.beat).map((zone) => zone.id),
    sceneTitle:
      state.beat === 'wake'
        ? '三方同时进门'
        : storySetPieceForBeat(state.beat)?.title || STAGE_ZONES.find((zone) => zone.id === activeZone)?.title || '',
  };
}

function stageComposition(state: PrologueState): StageComposition {
  const setPiece = storySetPieceForBeat(state.beat);
  const residue = sceneMemoryProps(state).map((prop) => prop.label);
  if (state.beat === 'wake') {
    return {
      title: '开场：三条事故同时进门',
      antagonist: '三方压力',
      conflict: '财务要钱、老板要上线、客户要免费再梳一次。',
      evidence: '工位屏幕上的财务、老板、客户三条未读',
      playerTask: '先读工位屏幕，决定第一句话回谁。',
      residue: [],
      next: STORY_BEATS.wake.next,
      tone: 'briefing',
    };
  }
  const base: StageComposition = {
    title: `${STORY_BEATS[state.beat].act.split('/')[0].trim()}：${setPiece?.title || '博哥工位'}`,
    antagonist: '系统压力',
    conflict: STORY_BEATS[state.beat].current,
    evidence: evidenceSummary(state, true).replace(/^资料：/, '') || '还没拿到能上桌的资料',
    playerTask: STORY_BEATS[state.beat].goal,
    residue,
    next: STORY_BEATS[state.beat].next,
    tone: setPiece?.tone || 'briefing',
  };
  if (state.beat === 'finance') {
    return {
      ...base,
      antagonist: '财务姐',
      conflict: 'GPU 账单爆了，但客户以为还是免费试用。',
      evidence: state.clues.includes('成本三列表')
        ? '成本三列表已经能上桌'
        : '先查账单白板，别空口报价',
      playerTask: '把资源消耗拆成基础包、加急包、试用额度。',
    };
  }
  if (state.beat === 'financeAudit') {
    return {
      ...base,
      antagonist: '财务姐',
      conflict: '她不问技术名词，只问这钱谁认。',
      evidence: state.decisions.includes('finance:quote')
        ? '报价入口已立住，预算名还要补'
        : '价格还悬着，预算追问会变硬',
      playerTask: '给收费试点、免费上限或自己先扛的明确选择。',
    };
  }
  if (state.beat === 'boss') {
    return {
      ...base,
      antagonist: '老板',
      conflict: '老板要一句“今天上线”，客户晚上会逐字验收。',
      evidence: state.clues.includes('验收三句话')
        ? '验收三句话已经写好'
        : '先看验收白板，别把漂亮话当合同',
      playerTask: '把今天上线改成小范围试点和验收说法。',
    };
  }
  if (state.beat === 'bossRehearsal') {
    return {
      ...base,
      antagonist: '老板',
      conflict: '话越体面，越容易在晚上变成追责。',
      evidence: state.debts.includes('full-launch')
        ? '全部上线承诺正在发烫'
        : '小范围试点还有失败退路',
      playerTask: '彩排客户听得懂、博哥兜得住的台词。',
    };
  }
  if (state.beat === 'customer') {
    return {
      ...base,
      antagonist: '客户姐',
      conflict: '一句“再梳一次”把免费售后和收费边界撞到一起。',
      evidence: state.clues.includes('范围单模板')
        ? '范围单模板已经在手'
        : '先拿范围单，别只靠嘴硬',
      playerTask: '决定先报价、补一次，还是先把拉倒讲清。',
    };
  }
  if (state.beat === 'customerReversal') {
    return {
      ...base,
      antagonist: '客户姐',
      conflict: '“顺手全部上线”开始膨胀，补一次会变成补全世界。',
      evidence: state.decisions.includes('customerReversal:quote-table')
        ? '报价表已经上桌'
        : state.clues.includes('范围单模板')
          ? '范围单能把顺手拆开'
          : '范围单没拿，顺手两个字很危险',
      playerTask: '把顺手拆成报价表、小范围试点或体面退场。',
    };
  }
  return base;
}

function activeZoneForBeat(beat: Beat): ZoneId {
  if (beat === 'wake') return 'desk';
  if (beat === 'finance' || beat === 'financeAudit') return 'finance';
  if (beat === 'boss' || beat === 'bossRehearsal') return 'boss';
  if (beat === 'customer' || beat === 'customerReversal') return 'customer';
  return 'briefing';
}

function zoneUnlocked(zone: ZoneId, beat: Beat): boolean {
  const step = beatStep(beat);
  if (zone === 'desk') return true;
  if (zone === 'finance') return step >= beatStep('finance');
  if (zone === 'boss') return step >= beatStep('boss');
  if (zone === 'customer') return step >= beatStep('customer');
  return step >= beatStep('customerReversal');
}

function hotspotVisible(spot: HotspotDefinition, state: PrologueState): boolean {
  const step = beatStep(state.beat);
  if (spot.id === 'desk') return state.beat === 'wake';
  if (spot.kind === 'menu') return step > beatStep('wake');
  if (spot.id === 'ledger') return step >= beatStep('finance');
  if (spot.id === 'whiteboard') return step >= beatStep('boss');
  if (spot.id === 'contract') return step >= beatStep('customer');
  if (spot.id === 'briefing') return step >= beatStep('customerReversal');
  return true;
}

function hotspotSceneVisible(spot: HotspotDefinition, state: PrologueState): boolean {
  if (state.mode !== 'map') return false;
  if (spot.id === 'menu') return false;
  if (state.beat === 'wake') return spot.id === 'desk';
  if (state.beat === 'finance' || state.beat === 'financeAudit') return spot.id === 'ledger';
  if (state.beat === 'boss' || state.beat === 'bossRehearsal') return spot.id === 'whiteboard';
  if (state.beat === 'customer') return spot.id === 'contract';
  if (state.beat === 'customerReversal')
    return spot.id === 'contract' || spot.id === 'briefing';
  return spot.id === 'briefing';
}

function hotspotVisualSnapshots(state: PrologueState): Array<{
  id: string;
  kind: HotspotDefinition['kind'];
  readClue: boolean;
  marker: string;
  outline: 'hidden-clue-zone' | 'target-frame' | 'subtle';
}> {
  const target = STORY_BEATS[state.beat].target;
  return HOTSPOTS.filter(
    (spot) => hotspotVisible(spot, state) && hotspotSceneVisible(spot, state),
  ).map((spot) => {
    const readClue = spot.kind === 'clue' && state.clues.includes(spot.clue || '');
    const isTarget =
      spot.id === target ||
      (target === 'finance' && spot.id === 'ledger') ||
      (target === 'boss' && spot.id === 'whiteboard') ||
      (target === 'customer' && spot.id === 'contract') ||
      (target === 'battle' && spot.id === 'briefing');
    const marker =
      spot.kind === 'clue' && !readClue && state.timeLeft > 0
        ? '资料'
        : isTarget && spot.kind === 'prep'
          ? `${state.preps.length}/3 已练`
          : '';
    return {
      id: spot.id,
      kind: spot.kind,
      readClue,
      marker,
      outline: spot.kind === 'clue' ? 'hidden-clue-zone' : isTarget ? 'target-frame' : 'subtle',
    };
  });
}

function zoneCompleted(zone: ZoneId, beat: Beat): boolean {
  const step = beatStep(beat);
  if (zone === 'desk') return step > beatStep('wake');
  if (zone === 'finance') return step > beatStep('financeAudit');
  if (zone === 'boss') return step > beatStep('bossRehearsal');
  if (zone === 'customer') return step > beatStep('customerReversal');
  return beat === 'ending';
}

function zoneOutcomeLabel(zone: ZoneId, state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (zone === 'desk') return '已醒来';
  if (zone === 'finance') {
    if (has('financeAudit:self-bear')) return '先背锅';
    if (has('financeAudit:free-cap')) return '免费上限';
    if (has('financeAudit:paid-pilot') || has('finance:quote')) return '已报价';
    if (has('finance:empathy')) return '先稳住';
    return '账已拆';
  }
  if (zone === 'boss') {
    if (has('bossRehearsal:overpromise')) return '话说满';
    if (has('boss:hard')) return '硬上线';
    if (has('bossRehearsal:rollback')) return '失败退路';
    if (has('boss:poc') || has('bossRehearsal:poc-script')) return '试点上线';
    if (has('boss:scope')) return '定验收';
    return '已彩排';
  }
  if (zone === 'customer') {
    if (has('customerReversal:walkaway-line') || has('customer:walkaway'))
      return '体面拉倒';
    if (has('customerReversal:poc-only') || has('customer:compensate'))
      return '补试点';
    if (has('customerReversal:quote-table') || has('customer:quote'))
      return '报价开谈';
    return '已接招';
  }
  if (state.preps.length) return `备 ${state.preps.length}/3`;
  return '待谈判';
}

function sceneMemoryProps(state: PrologueState): SceneMemoryProp[] {
  const memories: SceneMemoryProp[] = [];
  const step = beatStep(state.beat);
  if (step >= beatStep('financeAudit') && hasFinanceMemory(state)) {
    memories.push({
      label: '上午账单',
      line: financeMemoryLine(state),
      color: 0xc98035,
    });
  }
  if (step >= beatStep('bossRehearsal') && hasBossMemory(state)) {
    memories.push({
      label: '上线说法',
      line: bossMemoryLine(state),
      color: 0x3d6fa5,
    });
  }
  if (step >= beatStep('customerReversal') && hasCustomerMemory(state)) {
    memories.push({
      label: '客户边界',
      line: customerMemoryLine(state),
      color: 0x2d8f73,
    });
  }
  return memories;
}

function hasFinanceMemory(state: PrologueState): boolean {
  return state.decisions.some((decision) =>
    decision.startsWith('finance:') || decision.startsWith('financeAudit:'),
  );
}

function hasBossMemory(state: PrologueState): boolean {
  return state.decisions.some((decision) =>
    decision.startsWith('boss:') || decision.startsWith('bossRehearsal:'),
  );
}

function hasCustomerMemory(state: PrologueState): boolean {
  return state.decisions.some((decision) =>
    decision.startsWith('customer:') || decision.startsWith('customerReversal:'),
  );
}

function financeMemoryLine(state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (has('financeAudit:self-bear')) return '钱暂时压在博哥身上。';
  if (has('financeAudit:free-cap')) return '免费有上限，价还要补。';
  if (has('financeAudit:paid-pilot') || has('finance:quote'))
    return '收费入口立住了。';
  if (has('finance:empathy')) return '关系稳住，账还悬着。';
  return '账单拆出三列。';
}

function bossMemoryLine(state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (has('bossRehearsal:overpromise') || has('boss:hard'))
    return '今天上线说得太满。';
  if (has('bossRehearsal:rollback')) return '失败退路写上了。';
  if (has('boss:poc') || has('bossRehearsal:poc-script'))
    return '小范围试点能说。';
  if (has('boss:scope')) return '验收边界先画出。';
  return '上线别说太满。';
}

function customerMemoryLine(state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (has('customerReversal:walkaway-line') || has('customer:walkaway'))
    return '拉倒台阶放好了。';
  if (has('customerReversal:poc-only') || has('customer:compensate'))
    return '补一次锁小范围。';
  if (has('customerReversal:quote-table') || has('customer:quote'))
    return '报价先上桌。';
  return '免费玩笑变收费题。';
}

function zoneCenter(id: ZoneId): { x: number; y: number } {
  const zone = STAGE_ZONES.find((item) => item.id === id);
  if (!zone) return { x: GAME_W / 2, y: WORLD_H / 2 };
  return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
}

function activeActorBarks(state: PrologueState): Array<{ id: string; name: string; line: string }> {
  return ACTORS.filter((actor) => actor.beat === state.beat).map((actor) => ({
    id: actor.id,
    name: actor.name,
    line: actorLine(actor, state),
  }));
}

function boThoughtLine(state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (state.beat === 'wake') return '先别回可以。';
  if (state.beat === 'finance') {
    if (has('opening:customer')) return '先稳客户，钱更难了。';
    if (has('opening:boss')) return '上线之前先补账。';
    return '把钱拆成服务。';
  }
  if (state.beat === 'financeAudit') {
    if (has('finance:quote')) return '报价有了，预算要落名。';
    if (has('finance:empathy')) return '稳住了，但价还没立。';
    return '免费得有上限。';
  }
  if (state.beat === 'boss') {
    if (state.debts.includes('budget-blame')) return '背着账谈上线，难。';
    return '今天上线不能说满。';
  }
  if (state.beat === 'bossRehearsal') {
    if (has('boss:hard')) return '这话太满，晚上会疼。';
    if (has('boss:poc')) return '试点要说得像人话。';
    return '漂亮话也要能验收。';
  }
  if (state.beat === 'customer') return '笑话背后是收费边界。';
  if (state.beat === 'customerReversal') {
    if (has('customer:quote')) return '顺手也得算钱。';
    if (has('customer:compensate')) return '补一次别补全世界。';
    if (has('customer:walkaway')) return '拉倒也要留台阶。';
    return '顺手两个字最贵。';
  }
  if (state.beat === 'battle') return '钱、关系、边界保两个。';
  return '收工要看还剩什么。';
}

function boThoughtPlacement(state: PrologueState): { x: number; y: number; tailX: number } {
  const actor = ACTORS.find((item) => item.beat === state.beat);
  let offsetX = state.player.x < GAME_W / 2 ? 118 : -118;
  let offsetY = -72;
  if (actor) {
    const nearActor =
      Phaser.Math.Distance.Between(state.player.x, state.player.y, actor.x, actor.y) < 190;
    offsetX = state.player.x <= actor.x ? -122 : 122;
    offsetY = nearActor ? -58 : -72;
  }
  if (state.beat === 'wake') {
    offsetX = state.player.x < 260 ? 120 : -120;
    offsetY = -64;
  }
  const x = clamp(state.player.x + offsetX, 112, GAME_W - 112);
  const y = clamp(state.player.y + offsetY, 142, WORLD_H - 82);
  const tailX = clamp(state.player.x - x, -70, 70);
  return { x, y, tailX };
}

function actorLine(actor: ActorDefinition, state: PrologueState): string {
  const has = (id: string) => state.decisions.includes(id);
  if (actor.id === 'finance' && actor.beat === 'finance') {
    if (has('opening:customer')) return '先回客户，钱谁认？';
    if (has('opening:boss')) return '上线先别把账忘了。';
    if (has('opening:finance')) return '好，先把钱拆清。';
    return '这钱谁来认？';
  }
  if (actor.id === 'finance') {
    if (has('finance:quote')) return '有报价，还差预算名。';
    if (has('finance:empathy')) return '情绪稳了，价还悬。';
    return '预算不能糊。';
  }
  if (actor.id === 'boss' && actor.beat === 'boss') {
    if (has('financeAudit:self-bear')) return '你先扛？那更要上线。';
    if (has('financeAudit:paid-pilot')) return '收费试点，也得体面。';
    if (has('financeAudit:free-cap')) return '有台阶，就别说满。';
    return '今天必须上线。';
  }
  if (actor.id === 'boss') {
    if (has('boss:hard')) return '全上这话你兜住。';
    if (has('boss:poc')) return '试点上线，能播。';
    if (has('boss:scope')) return '验收边界别丢。';
    return '台词要体面。';
  }
  if (actor.id === 'customer' && actor.beat === 'customer') {
    if (state.debts.includes('full-launch') || state.debts.includes('overpromise'))
      return '你们说今天上线？';
    if (has('financeAudit:paid-pilot')) return '再梳一次也收钱？';
    return '再梳一次呗。';
  }
  if (actor.id === 'customer') {
    if (has('customer:quote')) return '全部上线怎么算钱？';
    if (has('customer:compensate')) return '补一次，顺手全上？';
    if (has('customer:walkaway')) return '你说拉倒，怎么退？';
    return '顺手全部上线吧。';
  }
  return actor.role;
}

function endingTitle(ending: Ending): string {
  return (
    {
      paid: '结局：收到钱，但没把关系打碎',
      'bounded-comp': '结局：补一次，但边界写进了单子',
      'clean-walkaway': '结局：体面拉倒，证据留齐',
      'poc-limbo': '结局：小范围试点暂缓，明天继续收尾',
      'free-burnout': '结局：免费干崩，遗留问题爆了',
      '': '结局：未完成',
    }[ending] || '结局：未完成'
  );
}

function endingSummary(ending: Ending): string {
  return (
    {
      paid:
        '客户姐签了基础包，博哥没有赢成爽文，但至少把“再梳一次”变成了能收钱的服务。',
      'bounded-comp':
        '博哥答应再梳一次，可这次有小范围试点范围、有验收说法、有范围单，不再是一直免费。',
      'clean-walkaway':
        '双方没有硬成交，但博哥把拉倒说得体面：证据、台阶、后续报价都留着。',
      'poc-limbo':
        '今天没完全谈死，也没完全谈成。客户愿意看小范围试点，明天要继续补材料。',
      'free-burnout':
        '博哥被“免费再来一次”拖穿了耐心，钱没收上来，范围还越滚越大。',
      '':
        '今天还没结束。',
    }[ending] || '今天还没结束。'
  );
}
