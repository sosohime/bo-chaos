import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';
import {
  BOSS_UNLOCK_COUNT,
  HOTSPOTS,
  NPCS,
  PLAYER_PORTRAIT_FRAME_H,
  PLAYER_PORTRAIT_FRAME_W,
  PLAYER_WALK_FRAME_H,
  PLAYER_WALK_FRAME_W,
  QUESTS,
  TRAINING_LABELS,
  WORLD_H,
  WORLD_W,
  skillById,
  openQuests,
  questById,
} from './data';
import {
  applySkill,
  battleSkillDeck,
  beginQuest,
  clearIssue,
  prep,
  recommendedSkillIds,
  rest,
  settleBattle,
  stabilize,
  startBattle,
  train,
  usableSkills,
} from './sim';
import {
  addLog,
  clamp,
  completedNormalCount,
  decodeSave,
  defaultState,
  encodeSave,
  loadState,
  money,
  normalizeState,
  persistState,
} from './state';
import type {
  BattleState,
  Direction,
  Hotspot,
  MapId,
  Npc,
  Quest,
  SaveState,
  Skill,
  TrainingKey,
} from './types';

const PANEL = 0x12282d;
const PANEL_2 = 0x173a34;
const GOLD = 0xffdf86;
const CREAM = 0xfff5d6;
const MUTED = 0xcfe5dc;
const GREEN = 0x2ed09b;
const BLUE = 0x2f6fb8;
const RED = 0xc85d45;
const SHADOW = 0x071214;
const PLAYER_SPEED = 268;
const PLAYER_MAP_SCALE = 0.5;
const PLAYER_FOOT_ANCHOR_Y = 0.93;
const NPC_MAP_SCALE = 0.48;
const NPC_FOOT_ANCHOR_Y = 0.93;

interface AssetUrls {
  boWalk: string;
  boPortraits: string;
  boActions: string;
  npcAtlas: string;
  officeMap: string;
  siteMap: string;
}

interface QaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QaCamera {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  cameraX: number;
  cameraY: number;
}

interface YuanboQaSnapshot {
  scene: SaveState['scene'];
  mapId: MapId;
  canvas: { width: number; height: number; dpr: number };
  camera: QaCamera;
  player: {
    world: { x: number; y: number };
    screen: { x: number; y: number };
    direction: Direction;
    frame: number;
    moving: boolean;
    spriteBounds: QaRect;
    footScreen: { x: number; y: number };
    shadowBounds: QaRect;
    shadowCenter: { x: number; y: number };
    footToShadowY: number;
  };
  npcs: Array<{
    id: string;
    name: string;
    world: { x: number; y: number };
    screen: { x: number; y: number };
    spriteBounds: QaRect;
    footScreen: { x: number; y: number };
    shadowCenter: { x: number; y: number };
    footToShadowY: number;
  }>;
  overlay: { visible: boolean; title: string; ageMs: number };
  battle: {
    questId: string;
    round: number;
    outcome: BattleState['outcome'];
    lastSkill: string;
  } | null;
  nearest: { id: string; action: string } | null;
  counts: {
    expectedHotspots: number;
    renderedHotspots: number;
    expectedNpcs: number;
    renderedNpcs: number;
  };
  stateSummary: {
    day: number;
    actionPoints: number;
    resources: SaveState['resources'];
    completed: string[];
    failed: string[];
    issues: Array<{ id: string; kind: string; label: string; severity: number }>;
    ending: string;
  };
  assets: {
    officeMap: string;
    siteMap: string;
  };
  saveOverlayVisible: boolean;
}

interface YuanboQaApi {
  snapshot: () => YuanboQaSnapshot;
  reset: () => YuanboQaSnapshot;
  setState: (state: unknown) => YuanboQaSnapshot;
  moveTo: (mapId: MapId, x: number, y: number) => YuanboQaSnapshot;
  interact: () => YuanboQaSnapshot;
  startQuest: (questId: string) => YuanboQaSnapshot;
  useSkill: (skillId: string) => YuanboQaSnapshot;
  useRecommendedSkill: () => YuanboQaSnapshot;
  stabilize: () => YuanboQaSnapshot;
  finishBattle: () => YuanboQaSnapshot;
  closeOverlay: () => YuanboQaSnapshot;
  showSaveMenu: () => YuanboQaSnapshot;
}

declare global {
  interface Window {
    __YUANBO_QA__?: YuanboQaApi;
  }
}

export function startYuanboPixiGame(root: HTMLElement): () => void {
  const urls: AssetUrls = {
    boWalk: root.dataset.boWalkSrc || '/codex-pets/yuanbo-pixi/v1/bo-walk.png',
    boPortraits:
      root.dataset.boPortraitsSrc || '/codex-pets/yuanbo-pixi/v1/bo-portraits.png',
    boActions: root.dataset.boActionsSrc || '/codex-pets/yuanbo-pixi/v1/bo-actions.png',
    npcAtlas: root.dataset.npcAtlasSrc || '/codex-pets/yuanbo-pixi/v1/npc-atlas.png',
    officeMap:
      root.dataset.officeMapSrc || '/codex-pets/yuanbo-pixi/v1/office-map-floor-v2.png',
    siteMap:
      root.dataset.siteMapSrc || '/codex-pets/yuanbo-pixi/v1/site-map-floor-v2.png',
  };
  let app: Application | undefined;
  let game: YuanboPixiGame | undefined;
  let destroyed = false;
  let appDestroyed = false;
  const touch = createTouchControls(root);

  root.replaceChildren(touch);
  boot().catch((error) => {
    if (destroyed) return;
    root.appendChild(renderFatal(String(error)));
  });

  async function boot(): Promise<void> {
    app = new Application();
    await app.init({
      resizeTo: root,
      background: '#102324',
      antialias: false,
      autoDensity: true,
      resolution: Math.max(1, Math.min(2.5, window.devicePixelRatio || 1)),
    });
    if (destroyed) {
      destroyApp();
      return;
    }
    root.prepend(app.canvas);
    const qaEnabled = import.meta.env.DEV || new URLSearchParams(window.location.search).has('qa');
    game = new YuanboPixiGame(root, app, touch, urls, qaEnabled);
    await game.init();
  }

  return () => {
    destroyed = true;
    game?.destroy();
    destroyApp();
    touch.remove();
  };

  function destroyApp(): void {
    if (!app || appDestroyed) return;
    appDestroyed = true;
    try {
      app.destroy({ removeView: true }, { children: true });
    } catch {
      try {
        app.destroy();
      } catch {
        // The page is leaving; there is nothing useful to recover here.
      }
    }
  }
}

class YuanboPixiGame {
  private state: SaveState = loadState();
  private battle?: BattleState;
  private rootScene = new Container();
  private world = new Container();
  private mapContent?: Container;
  private ui = new Container();
  private overlay?: Container;
  private modalOpenedAt = 0;
  private keys = new Set<string>();
  private virtual = { x: 0, y: 0 };
  private player?: Sprite;
  private playerShadow?: Graphics;
  private playerLabel?: Container;
  private playerDir: Direction = 'down';
  private playerFrame = 0;
  private frameClock = 0;
  private lastMoveSave = 0;
  private dirty = false;
  private skillPage = 0;
  private walkTextures: Record<Direction, Texture[]> = {
    down: [],
    left: [],
    right: [],
    up: [],
  };
  private portraitTextures: Texture[] = [];
  private actionTextures: Texture[] = [];
  private npcTextures = new Map<string, Texture>();
  private mapTextures: Partial<Record<MapId, Texture>> = {};
  private resizeTimer = 0;
  private overlayTitle = '';
  private moving = false;
  private renderedHotspots = 0;
  private renderedNpcs = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly app: Application,
    private readonly touch: HTMLDivElement,
    private readonly urls: AssetUrls,
    private readonly qaEnabled: boolean,
  ) {}

  async init(): Promise<void> {
    this.app.stage.addChild(this.rootScene);
    this.rootScene.addChild(this.world, this.ui);
    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointertap', (event) => this.handleStageTap(event.global.x, event.global.y));
    await this.loadBoTextures();
    this.battle = this.state.battle || undefined;
    this.bindInput();
    this.draw();
    this.app.ticker.add((ticker) => this.update(ticker.deltaMS));
    this.installQaApi();
    this.saveNow();
  }

  destroy(): void {
    this.saveNow();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    if (window.__YUANBO_QA__?.snapshot === this.qaSnapshot) {
      delete window.__YUANBO_QA__;
    }
  }

  private async loadBoTextures(): Promise<void> {
    const [walk, portraits, actions, npcAtlas, officeMap, siteMap] = await Promise.all([
      Assets.load<Texture>(this.urls.boWalk),
      Assets.load<Texture>(this.urls.boPortraits),
      Assets.load<Texture>(this.urls.boActions),
      Assets.load<Texture>(this.urls.npcAtlas),
      Assets.load<Texture>(this.urls.officeMap),
      Assets.load<Texture>(this.urls.siteMap),
    ]);
    const dirs: Direction[] = ['down', 'left', 'right', 'up'];
    dirs.forEach((dir, dirIndex) => {
      this.walkTextures[dir] = [0, 1, 2, 3].map(
        (i) =>
          new Texture({
            source: walk.source,
            frame: new Rectangle(
              i * PLAYER_WALK_FRAME_W,
              dirIndex * PLAYER_WALK_FRAME_H,
              PLAYER_WALK_FRAME_W,
              PLAYER_WALK_FRAME_H,
            ),
          }),
      );
    });
    this.portraitTextures = [0, 1, 2, 3, 4, 5].map(
      (i) =>
        new Texture({
          source: portraits.source,
          frame: new Rectangle(
            i * PLAYER_PORTRAIT_FRAME_W,
            0,
            PLAYER_PORTRAIT_FRAME_W,
            PLAYER_PORTRAIT_FRAME_H,
          ),
        }),
    );
    this.actionTextures = Array.from({ length: 12 }, (_, i) =>
      new Texture({
        source: actions.source,
        frame: new Rectangle(i * PLAYER_PORTRAIT_FRAME_W, 0, PLAYER_PORTRAIT_FRAME_W, PLAYER_PORTRAIT_FRAME_H),
      }),
    );
    ['gpu', 'agent', 'sla', 'compliance', 'cost', 'shadow', 'meeting', 'rival', 'boss'].forEach((id, i) => {
      this.npcTextures.set(
        id,
        new Texture({
          source: npcAtlas.source,
          frame: new Rectangle(i * PLAYER_PORTRAIT_FRAME_W, 0, PLAYER_PORTRAIT_FRAME_W, PLAYER_PORTRAIT_FRAME_H),
        }),
      );
    });
    this.mapTextures.office = officeMap;
    this.mapTextures.site = siteMap;
  }

  private bindInput(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);
    this.touch.addEventListener('yuanbo-vector', ((event: CustomEvent) => {
      this.virtual = event.detail;
    }) as EventListener);
    this.touch.addEventListener('yuanbo-interact', () => this.interact());
    this.touch.addEventListener('yuanbo-menu', () => this.showSaveMenu());
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
      event.preventDefault();
      this.keys.add(event.key.toLowerCase());
    }
    if (event.key === 'e' || event.key === 'E' || event.key === ' ') {
      event.preventDefault();
      this.interact();
    }
    if (event.key === 'Escape') this.closeOverlay();
    if (event.key === 'm' || event.key === 'M') this.showSaveMenu();
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key.toLowerCase());
  };

  private onResize = (): void => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.draw();
    }, 80);
  };

  private update(deltaMS: number): void {
    if (this.state.scene !== 'map' || this.overlay) {
      this.moving = false;
      return;
    }
    const vector = this.inputVector();
    if (Math.abs(vector.x) > Math.abs(vector.y)) {
      if (vector.x < -0.05) this.playerDir = 'left';
      if (vector.x > 0.05) this.playerDir = 'right';
    } else {
      if (vector.y < -0.05) this.playerDir = 'up';
      if (vector.y > 0.05) this.playerDir = 'down';
    }
    const moving = Math.hypot(vector.x, vector.y) > 0.05;
    this.moving = moving;
    const point = this.state.player[this.state.mapId];
    if (moving) {
      const dt = Math.min(deltaMS, 40) / 1000;
      point.x = clamp(point.x + vector.x * PLAYER_SPEED * dt, 58, WORLD_W - 58);
      point.y = clamp(point.y + vector.y * PLAYER_SPEED * dt, 128, WORLD_H - 58);
      this.frameClock += deltaMS;
      while (this.frameClock >= 115) {
        this.playerFrame = (this.playerFrame + 1) % 4;
        this.frameClock -= 115;
      }
      this.updatePlayerSprite();
      this.updateCameraObjects();
      this.markDirty();
    } else if (this.playerFrame !== 0) {
      this.playerFrame = 0;
      this.frameClock = 0;
      this.updatePlayerSprite();
      this.updateCameraObjects();
      this.saveNow();
    }
    this.updateTouchLabel();
    this.flushMoveSave();
  }

  private markDirty(): void {
    this.dirty = true;
  }

  private flushMoveSave(): void {
    if (!this.dirty) return;
    const now = performance.now();
    if (now - this.lastMoveSave < 800) return;
    this.saveNow();
  }

  private saveNow(): void {
    this.state.battle = this.battle || null;
    persistState(this.state);
    this.dirty = false;
    this.lastMoveSave = performance.now();
  }

  private draw(): void {
    const currentOverlay = this.overlay && !this.overlay.destroyed ? this.overlay : undefined;
    this.world.removeChildren();
    this.ui.removeChildren();
    this.mapContent = undefined;
    this.player = undefined;
    this.playerShadow = undefined;
    this.playerLabel = undefined;
    this.renderedHotspots = 0;
    this.renderedNpcs = 0;
    this.app.stage.hitArea = new Rectangle(0, 0, this.w(), this.h());
    this.drawBackground();
    if (this.state.scene === 'battle' && this.battle) {
      this.touch.setAttribute('hidden', '');
      this.drawBattle();
    } else {
      this.touch.removeAttribute('hidden');
      this.drawMap();
    }
    if (currentOverlay) {
      this.overlay = currentOverlay;
      this.ui.addChild(currentOverlay);
      this.touch.setAttribute('hidden', '');
    }
    this.updateTouchLabel();
  }

  private drawBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.w(), this.h()).fill(0x102324);
    for (let x = 0; x < this.w(); x += 24) bg.moveTo(x, 0).lineTo(x, this.h());
    for (let y = 0; y < this.h(); y += 24) bg.moveTo(0, y).lineTo(this.w(), y);
    bg.stroke({ color: 0xfff8dc, alpha: 0.05, width: 1 });
    this.world.addChild(bg);
  }

  private drawMap(): void {
    const layout = this.mapLayout();
    this.drawHud();
    const map = new Graphics();
    map.roundRect(layout.x, layout.y, layout.w, layout.h, this.mobile() ? 0 : 4).fill(0x1a4141);
    map.roundRect(layout.x, layout.y, layout.w, layout.h, this.mobile() ? 0 : 4).stroke({ color: GOLD, width: 2, alpha: 0.8 });
    this.world.addChild(map);
    this.mapContent = new Container();
    this.world.addChild(this.mapContent);
    this.updateMapTransform(layout);
    this.drawTiles(layout);
    this.drawDecor(layout);
    HOTSPOTS.filter((spot) => spot.mapId === this.state.mapId).forEach((spot) => this.drawHotspot(layout, spot));
    NPCS.filter((npc) => npc.mapId === this.state.mapId && this.npcVisible(npc)).forEach((npc) => this.drawNpc(layout, npc));
    this.drawPlayer(layout);
    this.drawFooterHint();
  }

  private drawHud(): void {
    const hudH = this.mobile() ? 116 : 68;
    this.ui.addChild(rect(0, 0, this.w(), hudH, 0x0d1d20, 0.96, 0x406b64));
    this.ui.addChild(label('袁博の极限售后', 16, 10, this.mobile() ? 16 : 20, GOLD, this.mobile() ? this.w() - 112 : 360, '900'));
    if (this.mobile()) {
      this.ui.addChild(label(`DAY ${this.state.day} / 周目 ${this.state.cycle} / 行动 ${this.state.actionPoints}/3`, 16, 36, 11, MUTED, this.w() - 112, '900'));
      this.ui.addChild(label(`${money(this.state.resources.cash)} / 口碑 ${this.state.resources.reputation}`, 16, 56, 11, MUTED, this.w() - 112, '900'));
      this.ui.addChild(label(`体力 ${this.state.resources.energy} / 耐心 ${this.state.resources.patience}`, 16, 78, 11, 0xb8d5ce, this.w() - 34, '800'));
      this.ui.addChild(label(`边界 ${this.state.resources.boundary} / 压力 ${this.state.resources.pressure}`, 16, 98, 11, 0xb8d5ce, this.w() - 34, '800'));
    } else {
      const line = `DAY ${this.state.day} / 周目 ${this.state.cycle} · 行动 ${this.state.actionPoints}/3 · ${money(this.state.resources.cash)} · 口碑 ${this.state.resources.reputation}`;
      this.ui.addChild(label(line, 310, 14, 12, MUTED, this.w() - 132, '800'));
      const stat = `体力 ${this.state.resources.energy} / 耐心 ${this.state.resources.patience} / 边界 ${this.state.resources.boundary} / 压力 ${this.state.resources.pressure}`;
      this.ui.addChild(label(stat, 16, 42, 11, 0xb8d5ce, this.w() - 34, '700'));
    }
    this.ui.addChild(button(this.w() - (this.mobile() ? 78 : 120), 10, this.mobile() ? 64 : 104, 40, '菜单', () => this.showSaveMenu(), 0x294e58, 12));
  }

  private drawTiles(layout: ReturnType<YuanboPixiGame['mapLayout']>): void {
    const texture = this.mapTextures[this.state.mapId];
    if (texture) {
      const sprite = new Sprite(texture);
      sprite.x = 0;
      sprite.y = 0;
      sprite.width = WORLD_W;
      sprite.height = WORLD_H;
      this.mapContent?.addChild(sprite);
      return;
    }
    const fallback = new Graphics();
    fallback.rect(0, 0, WORLD_W, WORLD_H).fill(this.state.mapId === 'office' ? 0xeed9b2 : 0xd6e4ec);
    this.mapContent?.addChild(fallback);
  }

  private drawDecor(layout: ReturnType<YuanboPixiGame['mapLayout']>): void {
    HOTSPOTS.filter((spot) => spot.mapId === this.state.mapId).forEach((spot) => {
      const asset = drawFacilityAsset(spot, 1);
      asset.x = spot.x;
      asset.y = spot.y;
      this.mapContent?.addChild(asset);
      this.renderedHotspots += 1;
      if (spot.kind !== 'portal') {
        this.mapContent?.addChild(centerLabel(spot.label, spot.x + spot.w / 2, spot.y - 18, 12, CREAM, 142));
      }
    });
  }

  private drawHotspot(layout: ReturnType<YuanboPixiGame['mapLayout']>, spot: Hotspot): void {
    const near = this.nearTarget()?.id === spot.id;
    const g = rect(spot.x, spot.y, spot.w, spot.h, near ? GOLD : 0xffffff, near ? 0.14 : 0.001, near ? GOLD : undefined);
    this.mapContent?.addChild(g);
  }

  private drawNpc(layout: ReturnType<YuanboPixiGame['mapLayout']>, npc: Npc): void {
    const quest = questById(npc.questId);
    if (!quest) return;
    const c = new Container();
    c.x = npc.x;
    c.y = npc.y;
    c.addChild(new Graphics().ellipse(0, 3, 24, 7).fill({ color: 0x000000, alpha: 0.2 }));
    const npcTexture = this.npcTextures.get(quest.id === 'boss' ? 'boss' : quest.id);
    if (npcTexture) {
      const sprite = new Sprite(npcTexture);
      sprite.anchor.set(0.5, NPC_FOOT_ANCHOR_Y);
      sprite.scale.set(NPC_MAP_SCALE);
      c.addChild(sprite);
    } else {
      c.addChild(drawCustomerSprite(npc, 1));
    }
    c.addChild(centerLabel(quest.boss ? 'BOSS' : `第${quest.chapter}幕`, 0, -88, 10, CREAM, 78, quest.boss ? 0x8e334d : BLUE));
    c.addChild(centerLabel(npc.name, 0, 45, 11, 0x18302f, 90, 0xfff7df));
    this.mapContent?.addChild(c);
    this.renderedNpcs += 1;
  }

  private drawPlayer(layout: ReturnType<YuanboPixiGame['mapLayout']>): void {
    const point = this.state.player[this.state.mapId];
    this.playerShadow = new Graphics().ellipse(0, 3, 27, 7).fill({ color: 0x000000, alpha: 0.24 });
    this.playerShadow.x = point.x;
    this.playerShadow.y = point.y;
    this.mapContent?.addChild(this.playerShadow);
    this.player = new Sprite(this.walkTextures[this.playerDir][this.playerFrame] || Texture.EMPTY);
    this.player.anchor.set(0.5, PLAYER_FOOT_ANCHOR_Y);
    this.player.x = point.x;
    this.player.y = point.y;
    this.player.scale.set(PLAYER_MAP_SCALE);
    this.mapContent?.addChild(this.player);
    this.playerLabel = centerLabel('博哥', point.x, point.y - 88, 12, CREAM, 64, BLUE);
    this.mapContent?.addChild(this.playerLabel);
  }

  private drawFooterHint(): void {
    const target = this.nearTarget();
    const text = target
      ? `${this.mobile() ? '点互动' : '按 E'}：${target.action}`
      : this.state.completed.length < 1
        ? '先找财务姐，把 GPU 账单这单收明白'
        : '找客户接单，或去训练台/准备桌补强';
    this.ui.addChild(centerLabel(text, this.w() / 2, this.mobile() ? Math.max(148, this.h() - 236) : this.h() - 22, 13, CREAM, this.w() - 40));
  }

  private drawBattle(): void {
    if (!this.battle) return;
    const quest = questById(this.battle.questId);
    if (!quest) return;
    this.drawBattleShell(quest);
    this.drawBattleStats(quest);
    this.drawBattleSkills(quest);
    this.drawBattleLog();
    if (this.battle.outcome) this.drawBattleResult(quest);
  }

  private drawBattleShell(quest: Quest): void {
    this.ui.addChild(rect(0, 0, this.w(), this.h(), 0x0b1a1e, 1));
    this.ui.addChild(label(quest.title, 20, 18, this.mobile() ? 22 : 30, GOLD, this.w() - 40, '900'));
    const phase = quest.boss && this.battle ? ` · ${quest.bossPhase?.[this.battle.phase - 1] || `第${this.battle.phase}阶段`}` : '';
    if (this.mobile()) {
      this.ui.addChild(label(`ROUND ${this.battle?.round}/6 · ${quest.client}${phase}`, 22, 52, 12, MUTED, this.w() - 44, '900'));
      this.ui.addChild(label(this.battle?.intent || quest.risk, 22, 76, 11, MUTED, this.w() - 44, '800'));
    } else {
      this.ui.addChild(label(`ROUND ${this.battle?.round}/6 · ${quest.client}${phase} · 意图：${this.battle?.intent || quest.risk}`, 22, 60, 12, MUTED, this.w() - 44, '800'));
    }
    const portrait = new Sprite(this.actionTextures[battleActionIndex(this.battle?.lastSkill)] || this.portraitTextures[0] || Texture.EMPTY);
    portrait.x = this.mobile() ? 20 : 42;
    portrait.y = this.mobile() ? 122 : 104;
    portrait.width = this.mobile() ? 96 : 142;
    portrait.height = this.mobile() ? 120 : 178;
    this.ui.addChild(rect(portrait.x - 8, portrait.y - 8, portrait.width + 16, portrait.height + 16, 0x12282d, 1, GOLD));
    this.ui.addChild(portrait);
  }

  private drawBattleStats(quest: Quest): void {
    if (!this.battle) return;
    const x = this.mobile() ? 142 : 230;
    const y = this.mobile() ? 128 : 108;
    this.ui.addChild(label('客户状态', x, y - 28, 15, GOLD, 220, '900'));
    const rows: Array<[string, number, number, boolean]> = [
      ['怒气', this.battle.client.anger, RED, true],
      ['预算', this.battle.client.budget, GOLD, false],
      ['蔓延', this.battle.client.scope, 0x7db0ff, true],
      ['信任', this.battle.client.trust, GREEN, false],
    ];
    rows.forEach(([name, value, color], index) => this.ui.addChild(bar(x, y + index * (this.mobile() ? 28 : 34), this.mobile() ? this.w() - x - 20 : 260, this.mobile() ? 16 : 18, name, value, color)));
    const rx = this.mobile() ? 20 : 548;
    const ry = this.mobile() ? 284 : 108;
    this.ui.addChild(label('博哥资源', rx, ry - 28, 15, GOLD, 220, '900'));
    const r = this.state.resources;
    [
      ['体力', r.energy, GREEN],
      ['耐心', r.patience, GOLD],
      ['边界', r.boundary, 0x7db0ff],
      ['压力', r.pressure, RED],
    ].forEach(([name, value, color], index) => this.ui.addChild(bar(rx, ry + index * (this.mobile() ? 28 : 34), this.mobile() ? this.w() - 40 : 260, this.mobile() ? 16 : 18, String(name), Number(value), Number(color))));
    const objectiveY = this.mobile() ? Math.max(388, Math.min(this.battleSkillStartY() - 62, 392)) : 272;
    this.ui.addChild(label(`目标：${quest.objective}`, this.mobile() ? 20 : 548, objectiveY, 12, CREAM, this.mobile() ? this.w() - 40 : 360, '800', this.mobile() ? 58 : undefined));
  }

  private drawBattleSkills(quest: Quest): void {
    if (!this.battle) return;
    const deck = battleSkillDeck(this.state, this.battle);
    const usable = usableSkills(this.state, this.battle).map((skill) => skill.id);
    const pageSize = this.mobile() ? 4 : 6;
    const maxPage = Math.max(0, Math.ceil(deck.length / pageSize) - 1);
    this.skillPage = clamp(this.skillPage, 0, maxPage);
    const skills = deck.slice(this.skillPage * pageSize, this.skillPage * pageSize + pageSize);
    const startY = this.battleSkillStartY();
    const cols = this.mobile() ? 2 : 3;
    const gap = this.mobile() ? 8 : 12;
    const bw = this.mobile() ? (this.w() - 48) / 2 : 260;
    const bh = this.mobile() ? 48 : 54;
    skills.forEach((skill, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = this.mobile() ? 20 + col * (bw + gap) : 42 + col * 286;
      const y = startY + row * (bh + gap);
      const disabled = !usable.includes(skill.id);
      const marked = recommendedSkillIds(this.state, quest, this.battle).includes(skill.id) ? '★' : '';
      this.ui.addChild(
        button(
          x,
          y,
          bw,
          bh,
          `${marked}${skill.name}｜${shortIntent(skill)}`,
          () => {
            applySkill(this.state, this.battle!, skill.id);
            this.saveNow();
            this.draw();
          },
          disabled ? 0x44484d : 0x285d72,
          this.mobile() ? 11 : 12,
          disabled,
        ),
      );
    });
    if (maxPage > 0) {
      this.ui.addChild(
        button(
          this.mobile() ? 20 : 42,
          this.mobile() ? startY + 2 * (bh + gap) : startY + 2 * (bh + 12),
          this.mobile() ? bw : 118,
          40,
          `上一页 ${this.skillPage + 1}/${maxPage + 1}`,
          () => {
            this.skillPage = this.skillPage <= 0 ? maxPage : this.skillPage - 1;
            this.draw();
          },
          0x294e58,
          11,
        ),
      );
      this.ui.addChild(
        button(
          this.mobile() ? 20 + bw + gap : 174,
          this.mobile() ? startY + 2 * (bh + gap) : startY + 2 * (bh + 12),
          this.mobile() ? bw : 118,
          40,
          '下一页',
          () => {
            this.skillPage = this.skillPage >= maxPage ? 0 : this.skillPage + 1;
            this.draw();
          },
          0x294e58,
          11,
        ),
      );
    }
    this.ui.addChild(
      button(
        this.mobile() ? 20 : 902 - 188,
        this.mobile() ? startY + (maxPage > 0 ? 3 : 2) * (bh + gap) : startY + 2 * (bh + 12),
        this.mobile() ? this.w() - 40 : 188,
        44,
        '缓一手回资源',
        () => {
          stabilize(this.state, this.battle!);
          this.saveNow();
          this.draw();
        },
        0x6a5422,
        12,
        Boolean(this.battle.outcome),
      ),
    );
  }

  private battleSkillStartY(): number {
    if (!this.mobile()) return 356;
    return this.h() < 760 ? this.h() - 186 : Math.max(430, this.h() - 230);
  }

  private drawBattleLog(): void {
    if (!this.battle || this.mobile()) return;
    this.ui.addChild(rect(548, 306, 370, 116, 0x10282d, 0.95, 0x406b64));
    this.ui.addChild(label(this.battle.log.slice(0, 4).join('\n'), 562, 320, 12, CREAM, 340, '700'));
  }

  private drawBattleResult(quest: Quest): void {
    if (!this.battle?.outcome) return;
    const outcome = this.battle.outcome;
    const title = outcome === 'win' ? '胜利' : outcome === 'partial' ? '部分成功' : '失败';
    const line = outcome === 'win' ? quest.win : outcome === 'partial' ? quest.partial : quest.fail;
    this.ui.addChild(rect(0, 0, this.w(), this.h(), 0x000000, 0.42));
    const pw = Math.min(this.w() - 32, this.mobile() ? 356 : 640);
    const ph = this.mobile() ? 290 : 238;
    const x = (this.w() - pw) / 2;
    const y = (this.h() - ph) / 2;
    this.ui.addChild(rect(x, y, pw, ph, outcome === 'win' ? PANEL_2 : outcome === 'partial' ? 0x3d341d : 0x3a1f1b, 0.98, GOLD));
    this.ui.addChild(label(title, x + 24, y + 22, 26, GOLD, pw - 48, '900'));
    this.ui.addChild(label(line, x + 24, y + 72, 14, CREAM, pw - 48, '800'));
    this.ui.addChild(
      button(x + 24, y + ph - 66, pw - 48, 44, this.state.ending ? '周目结算' : '回到地图', () => this.finishBattle(), 0x285d72, 13),
    );
  }

  private showQuestBrief(quest: Quest): void {
    const blocked = quest.cost > this.state.actionPoints;
    const recommended = recommendedSkillIds(this.state, quest)
      .map((id) => skillById(id)?.name)
      .filter(Boolean)
      .join(' / ');
    this.showPanel(quest.title, `${quest.brief}\n\n目标：${quest.objective}\n风险：${quest.risk}\n推荐打法：${recommended}\n消耗行动 ${quest.cost} · 奖励 ${money(quest.reward)}`, [
      {
        label: blocked ? '行动点不够' : '开始谈判',
        disabled: blocked,
        onClick: () => {
          const battle = beginQuest(this.state, quest);
          if (!battle) return;
          this.battle = battle;
          this.skillPage = 0;
          this.saveNow();
          this.closeOverlay();
          this.draw();
        },
      },
      { label: '先等等', onClick: () => this.closeOverlay() },
    ]);
  }

  private showBoard(): void {
    const count = completedNormalCount(this.state);
    const quests = openQuests(this.state)
      .map((quest) => `${quest.boss ? 'BOSS' : `第${quest.chapter}幕`} · ${quest.title}：${quest.objective}`)
      .join('\n');
    const next =
      count < 1
        ? '先找财务姐做 GPU 账单，把“免费解释”改成成本治理。'
        : count < 3
          ? '继续做办公室客户，谈完去训练台补报价/边界。'
          : count < BOSS_UNLOCK_COUNT
            ? '去客户现场接高级客户，完成 4 个普通客户后开 Boss。'
            : 'Boss 已可打，先清遗留或直接去客户现场验收。';
    this.showPanel(
      '今日经营面板',
      `当前目标：${next}\n\n可接客户：\n${quests || '今天没有新客户，先训练或收工。'}\n\n售后债：${debtLine(this.state)}\n\n清楚一点：接客户会消耗行动点；失败不会死档，但会让 Boss 更难。`,
      [{ label: '知道了', onClick: () => this.closeOverlay() }],
    );
  }

  private showTraining(): void {
    const options = Object.entries(TRAINING_LABELS).map(([key, item]) => ({
      label: `${item.name} Lv.${this.state.training[key as TrainingKey]} · ${money(90 + this.state.training[key as TrainingKey] * 80)}`,
      onClick: () => {
        const error = train(this.state, key as TrainingKey);
        this.saveNow();
        this.closeOverlay();
        if (error) this.toast(error);
        this.draw();
      },
    }));
    this.showPanel('训练台', '每天只有 3 点行动。训练不是加数字，是让下一场谈判少靠嘴硬。', [
      ...options,
      { label: '离开', onClick: () => this.closeOverlay() },
    ]);
  }

  private showPrep(): void {
    this.showPanel('售前准备', '准备会消耗 1 行动点，降低压力、补边界，并清掉一个轻量遗留。适合打 Boss 前垫一手。', [
      {
        label: '整理报价/验收/SLA',
        onClick: () => {
          const error = prep(this.state);
          this.saveNow();
          this.closeOverlay();
          if (error) this.toast(error);
          this.draw();
        },
      },
      { label: '离开', onClick: () => this.closeOverlay() },
    ]);
  }

  private showDebt(): void {
    this.showPanel('售后债板', `当前售后债：${debtLine(this.state)}\n\n清债会消耗 1 行动点，优先处理最危险的一条。Boss 会按售后债翻旧账，债越少越好打。`, [
      {
        label: this.state.issues.length ? '清一条最危险的债' : '暂无售后债',
        disabled: !this.state.issues.length,
        onClick: () => {
          const error = clearIssue(this.state);
          this.saveNow();
          this.closeOverlay();
          if (error) this.toast(error);
          this.draw();
        },
      },
      { label: '离开', onClick: () => this.closeOverlay() },
    ]);
  }

  private showRest(): void {
    this.showPanel('收工复盘', '收工会进入下一天，恢复体力和耐心，但要付云资源维护成本。', [
      {
        label: '确认收工',
        onClick: () => {
          rest(this.state);
          this.saveNow();
          this.closeOverlay();
          this.draw();
        },
      },
      { label: '先不睡', onClick: () => this.closeOverlay() },
    ]);
  }

  private showSaveMenu(): void {
    openSaveOverlay(this.state, {
      onImport: (state) => {
        this.state = state;
        this.battle = state.battle || undefined;
        this.saveNow();
        this.draw();
      },
      onReset: () => {
        this.state = defaultState();
        this.battle = undefined;
        this.saveNow();
        this.draw();
      },
    });
  }

  private installQaApi(): void {
    if (!this.qaEnabled) return;
    window.__YUANBO_QA__ = {
      snapshot: this.qaSnapshot,
      reset: () => {
        document.querySelector('.yrpg-save-overlay')?.remove();
        this.closeOverlay();
        this.state = defaultState();
        this.battle = undefined;
        this.playerDir = 'down';
        this.playerFrame = 0;
        this.frameClock = 0;
        this.moving = false;
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      setState: (state) => {
        document.querySelector('.yrpg-save-overlay')?.remove();
        this.closeOverlay();
        this.state = normalizeState(state);
        this.battle = this.state.battle || undefined;
        this.playerFrame = 0;
        this.frameClock = 0;
        this.moving = false;
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      moveTo: (mapId, x, y) => {
        document.querySelector('.yrpg-save-overlay')?.remove();
        this.closeOverlay();
        this.state.scene = 'map';
        this.state.battle = null;
        this.battle = undefined;
        this.state.mapId = mapId === 'site' ? 'site' : 'office';
        this.state.player[this.state.mapId] = {
          x: clamp(Math.floor(Number(x) || 0), 58, WORLD_W - 58),
          y: clamp(Math.floor(Number(y) || 0), 128, WORLD_H - 58),
        };
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      interact: () => {
        this.interact();
        return this.qaSnapshot();
      },
      startQuest: (questId) => {
        document.querySelector('.yrpg-save-overlay')?.remove();
        this.closeOverlay();
        const quest = questById(questId);
        if (!quest) throw new Error(`Unknown quest: ${questId}`);
        this.state.scene = 'battle';
        this.state.mapId = quest.mapId;
        this.battle = startBattle(this.state, quest.id);
        this.state.battle = this.battle;
        this.skillPage = 0;
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      useSkill: (skillId) => {
        if (!this.battle) throw new Error('No active battle.');
        applySkill(this.state, this.battle, skillId);
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      useRecommendedSkill: () => {
        if (!this.battle) throw new Error('No active battle.');
        const quest = questById(this.battle.questId);
        if (!quest) throw new Error(`Unknown quest: ${this.battle.questId}`);
        const usable = usableSkills(this.state, this.battle);
        const skill = recommendedSkillIds(this.state, quest, this.battle)
          .map((id) => usable.find((item) => item.id === id))
          .find(Boolean);
        if (skill) {
          applySkill(this.state, this.battle, skill.id);
        } else {
          stabilize(this.state, this.battle);
        }
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      stabilize: () => {
        if (!this.battle) throw new Error('No active battle.');
        stabilize(this.state, this.battle);
        this.saveNow();
        this.draw();
        return this.qaSnapshot();
      },
      finishBattle: () => {
        this.finishBattle();
        return this.qaSnapshot();
      },
      closeOverlay: () => {
        document.querySelector('.yrpg-save-overlay')?.remove();
        this.closeOverlay();
        return this.qaSnapshot();
      },
      showSaveMenu: () => {
        this.showSaveMenu();
        return this.qaSnapshot();
      },
    };
  }

  private qaSnapshot = (): YuanboQaSnapshot => {
    const layout = this.mapLayout();
    const point = this.state.player[this.state.mapId];
    const footScreen = this.toScreen(layout, point.x, point.y);
    const shadowCenter = this.toScreen(layout, point.x, point.y + 3);
    const playerWidth = PLAYER_WALK_FRAME_W * PLAYER_MAP_SCALE;
    const playerHeight = PLAYER_WALK_FRAME_H * PLAYER_MAP_SCALE;
    const visibleNpcs = NPCS.filter((npc) => npc.mapId === this.state.mapId && this.npcVisible(npc));
    const target = this.nearTarget();
    return {
      scene: this.state.scene,
      mapId: this.state.mapId,
      canvas: { width: this.w(), height: this.h(), dpr: window.devicePixelRatio || 1 },
      camera: { ...layout },
      player: {
        world: { x: point.x, y: point.y },
        screen: this.toScreen(layout, point.x, point.y),
        direction: this.playerDir,
        frame: this.playerFrame,
        moving: this.moving,
        spriteBounds: this.worldRectToScreen(layout, point.x - playerWidth / 2, point.y - playerHeight * PLAYER_FOOT_ANCHOR_Y, playerWidth, playerHeight),
        footScreen,
        shadowBounds: this.worldRectToScreen(layout, point.x - 27, point.y - 4, 54, 14),
        shadowCenter,
        footToShadowY: footScreen.y - shadowCenter.y,
      },
      npcs: visibleNpcs.map((npc) => {
        const npcWidth = PLAYER_PORTRAIT_FRAME_W * NPC_MAP_SCALE;
        const npcHeight = PLAYER_PORTRAIT_FRAME_H * NPC_MAP_SCALE;
        const npcFoot = this.toScreen(layout, npc.x, npc.y);
        const npcShadow = this.toScreen(layout, npc.x, npc.y + 3);
        return {
          id: npc.id,
          name: npc.name,
          world: { x: npc.x, y: npc.y },
          screen: this.toScreen(layout, npc.x, npc.y),
          spriteBounds: this.worldRectToScreen(layout, npc.x - npcWidth / 2, npc.y - npcHeight * NPC_FOOT_ANCHOR_Y, npcWidth, npcHeight),
          footScreen: npcFoot,
          shadowCenter: npcShadow,
          footToShadowY: npcFoot.y - npcShadow.y,
        };
      }),
      overlay: {
        visible: Boolean(this.overlay && !this.overlay.destroyed),
        title: this.overlayTitle,
        ageMs: this.overlay ? Math.max(0, performance.now() - this.modalOpenedAt) : 0,
      },
      battle: this.battle
        ? {
            questId: this.battle.questId,
            round: this.battle.round,
            outcome: this.battle.outcome,
            lastSkill: this.battle.lastSkill,
          }
        : null,
      nearest: target ? { id: target.id, action: target.action } : null,
      counts: {
        expectedHotspots: HOTSPOTS.filter((spot) => spot.mapId === this.state.mapId).length,
        renderedHotspots: this.renderedHotspots,
        expectedNpcs: visibleNpcs.length,
        renderedNpcs: this.renderedNpcs,
      },
      stateSummary: {
        day: this.state.day,
        actionPoints: this.state.actionPoints,
        resources: { ...this.state.resources },
        completed: [...this.state.completed],
        failed: [...this.state.failed],
        issues: this.state.issues.map((issue) => ({
          id: issue.id,
          kind: issue.kind,
          label: issue.label,
          severity: issue.severity,
        })),
        ending: this.state.ending,
      },
      assets: {
        officeMap: this.urls.officeMap,
        siteMap: this.urls.siteMap,
      },
      saveOverlayVisible: Boolean(document.querySelector('.yrpg-save-overlay')),
    };
  };

  private worldRectToScreen(
    layout: ReturnType<YuanboPixiGame['mapLayout']>,
    x: number,
    y: number,
    width: number,
    height: number,
  ): QaRect {
    const topLeft = this.toScreen(layout, x, y);
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: width * layout.scale,
      height: height * layout.scale,
    };
  }

  private showPanel(title: string, body: string, actions: Array<{ label: string; onClick: () => void; disabled?: boolean }>): void {
    this.closeOverlay();
    this.overlayTitle = title;
    const mobile = this.mobile();
    const w = Math.min(this.w() - 24, mobile ? 370 : 820);
    const h = Math.min(this.h() - 120, mobile ? 570 : 430);
    const x = (this.w() - w) / 2;
    const y = mobile ? Math.max(88, this.h() - h - 26) : (this.h() - h) / 2;
    const overlay = new Container();
    overlay.zIndex = 50;
    this.modalOpenedAt = performance.now();
    overlay.addChild(rect(0, 0, this.w(), this.h(), 0x000000, 0.34));
    overlay.addChild(rect(x, y, w, h, PANEL, 0.98, GOLD));
    overlay.addChild(label(title, x + 20, y + 18, mobile ? 22 : 26, GOLD, w - 40, '900'));
    const actionArea = actions.length <= 2 ? 72 : mobile ? Math.min(h - 120, actions.length * 54 + 16) : 164;
    overlay.addChild(label(body, x + 20, y + 62, mobile ? 13 : 14, CREAM, w - 40, '800', h - actionArea - 82));
    const cols = mobile ? 1 : Math.min(3, actions.length);
    const bw = mobile ? w - 40 : (w - 40 - (cols - 1) * 12) / cols;
    const bh = 44;
    actions.forEach((action, index) => {
      const row = mobile ? index : Math.floor(index / cols);
      const col = mobile ? 0 : index % cols;
      overlay.addChild(
        button(
          x + 20 + col * (bw + 12),
          y + h - 20 - (mobile ? actions.length - row : Math.ceil(actions.length / cols) - row) * (bh + 10),
          bw,
          bh,
          action.label,
          () => {
            if (performance.now() - this.modalOpenedAt < 180) return;
            action.onClick();
          },
          action.disabled ? 0x44484d : 0x285d72,
          12,
          action.disabled,
        ),
      );
    });
    this.overlay = overlay;
    this.ui.addChild(overlay);
    this.touch.setAttribute('hidden', '');
  }

  private closeOverlay(): void {
    this.overlay?.destroy({ children: true });
    this.overlay = undefined;
    this.overlayTitle = '';
    this.touch.removeAttribute('hidden');
  }

  private finishBattle(): void {
    if (!this.battle) return;
    settleBattle(this.state, this.battle);
    this.battle = undefined;
    this.saveNow();
    this.draw();
    if (this.state.ending) {
      this.showPanel('一周目结算', `${this.state.ending}\n\n你可以继续二周目，但公开 Alpha 的主线已经完整跑通。`, [
        {
          label: '继续经营',
          onClick: () => {
            this.state.cycle += 1;
            this.state.day += 1;
            this.state.completed = [];
            this.state.failed = [];
            this.state.issues = [];
            this.state.ending = '';
            this.state.actionPoints = 3;
            this.state.mapId = 'office';
            this.saveNow();
            this.closeOverlay();
            this.draw();
          },
        },
      ]);
    }
  }

  private interact(): void {
    if (this.state.scene === 'battle') return;
    if (this.overlay) return;
    const target = this.nearTarget();
    if (!target) {
      this.toast('靠近客户或设施再互动。');
      return;
    }
    if (target.npc) {
      const quest = questById(target.npc.questId);
      if (quest) this.showQuestBrief(quest);
      return;
    }
    if (!target.hotspot) return;
    if (target.hotspot.kind === 'board') this.showBoard();
    if (target.hotspot.kind === 'training') this.showTraining();
    if (target.hotspot.kind === 'prep') this.showPrep();
    if (target.hotspot.kind === 'debt') this.showDebt();
    if (target.hotspot.kind === 'rest') this.showRest();
    if (target.hotspot.kind === 'save') this.showSaveMenu();
    if (target.hotspot.kind === 'portal') {
      this.state.mapId = this.state.mapId === 'office' ? 'site' : 'office';
      this.state.player[this.state.mapId] = this.state.mapId === 'office' ? { x: 820, y: 380 } : { x: 130, y: 386 };
      this.saveNow();
      this.draw();
    }
  }

  private nearTarget(): { id: string; action: string; npc?: Npc; hotspot?: Hotspot } | null {
    const point = this.state.player[this.state.mapId];
    const npcs = NPCS.filter((npc) => npc.mapId === this.state.mapId && this.npcVisible(npc))
      .map((npc) => ({ npc, d: dist(point.x, point.y, npc.x, npc.y) }))
      .filter((item) => item.d < 86)
      .sort((a, b) => a.d - b.d);
    if (npcs[0]) {
      const quest = questById(npcs[0].npc.questId);
      return { id: npcs[0].npc.id, npc: npcs[0].npc, action: quest ? `接 ${quest.title}` : '接单' };
    }
    const spots = HOTSPOTS.filter((spot) => spot.mapId === this.state.mapId)
      .map((spot) => ({ spot, d: distToRect(point.x, point.y, spot.x - 16, spot.y - 16, spot.w + 32, spot.h + 32) }))
      .filter((item) => item.d < Math.max(42, Math.min(94, Math.max(item.spot.w, item.spot.h) * 0.4)))
      .sort((a, b) => a.d + hotspotPriority(a.spot) * 18 - (b.d + hotspotPriority(b.spot) * 18));
    if (spots[0]) return { id: spots[0].spot.id, hotspot: spots[0].spot, action: spots[0].spot.label };
    return null;
  }

  private npcVisible(npc: Npc): boolean {
    const quest = questById(npc.questId);
    return Boolean(quest && quest.unlock(this.state) && !this.state.completed.includes(quest.id));
  }

  private handleStageTap(x: number, y: number): void {
    if (this.overlay || this.state.scene !== 'map') return;
    const layout = this.mapLayout();
    if (x < layout.x || y < layout.y || x > layout.x + layout.w || y > layout.y + layout.h) return;
    const world = this.toWorld(layout, x, y);
    const targetNpc = NPCS.find((npc) => npc.mapId === this.state.mapId && this.npcVisible(npc) && dist(world.x, world.y, npc.x, npc.y) < 56);
    if (targetNpc) {
      const quest = questById(targetNpc.questId);
      if (quest) this.showQuestBrief(quest);
      return;
    }
    const targetSpot = HOTSPOTS.find((spot) => spot.mapId === this.state.mapId && world.x >= spot.x && world.x <= spot.x + spot.w && world.y >= spot.y && world.y <= spot.y + spot.h);
    if (targetSpot) {
      const previousMap = this.state.mapId;
      const old = { ...this.state.player[previousMap] };
      this.state.player[this.state.mapId] = { x: world.x, y: world.y };
      this.interact();
      if (this.state.mapId === previousMap) this.state.player[previousMap] = old;
    }
  }

  private inputVector(): { x: number; y: number } {
    const x =
      Number(this.keys.has('arrowright') || this.keys.has('d')) -
      Number(this.keys.has('arrowleft') || this.keys.has('a')) +
      this.virtual.x;
    const y =
      Number(this.keys.has('arrowdown') || this.keys.has('s')) -
      Number(this.keys.has('arrowup') || this.keys.has('w')) +
      this.virtual.y;
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  private updatePlayerSprite(): void {
    if (!this.player) return;
    this.player.texture = this.walkTextures[this.playerDir][this.playerFrame] || Texture.EMPTY;
  }

  private updateCameraObjects(): void {
    const layout = this.mapLayout();
    this.updateMapTransform(layout);
    const point = this.state.player[this.state.mapId];
    if (this.player) {
      this.player.x = point.x;
      this.player.y = point.y;
    }
    if (this.playerShadow) {
      this.playerShadow.x = point.x;
      this.playerShadow.y = point.y;
    }
    if (this.playerLabel) {
      this.playerLabel.x = point.x;
      this.playerLabel.y = point.y - 88;
    }
  }

  private updateMapTransform(layout: ReturnType<YuanboPixiGame['mapLayout']>): void {
    if (!this.mapContent) return;
    this.mapContent.x = Math.round(layout.x - layout.cameraX * layout.scale);
    this.mapContent.y = Math.round(layout.y - layout.cameraY * layout.scale);
    this.mapContent.scale.set(layout.scale);
  }

  private updateTouchLabel(): void {
    const button = this.touch.querySelector('.yrpg-touch-bridge__interact');
    if (!(button instanceof HTMLButtonElement)) return;
    const target = this.nearTarget();
    button.textContent = target?.npc ? '接单' : target?.hotspot ? target.hotspot.label.slice(0, 4) : '互动';
  }

  private toast(text: string): void {
    const toast = centerLabel(text, this.w() / 2, this.mobile() ? 116 : 92, 14, CREAM, this.w() - 40, 0x173434);
    this.ui.addChild(toast);
    window.setTimeout(() => {
      if (!toast.destroyed) toast.destroy();
    }, 1400);
  }

  private mapLayout(): { x: number; y: number; w: number; h: number; scale: number; cameraX: number; cameraY: number } {
    const top = this.mobile() ? 118 : 72;
    const bottom = this.mobile() ? 28 : 24;
    const maxW = this.mobile() ? this.w() : Math.min(this.w() - 48, 1120);
    const maxH = this.h() - top - bottom;
    const scale = this.mobile() ? 1.08 : Math.min(maxW / WORLD_W, maxH / WORLD_H);
    const viewW = maxW / scale;
    const viewH = maxH / scale;
    const p = this.state.player[this.state.mapId];
    const cameraX = this.mobile() ? clamp(p.x - viewW / 2, 0, WORLD_W - viewW) : 0;
    const cameraY = this.mobile() ? clamp(p.y - viewH / 2 + 38, 0, WORLD_H - viewH) : 0;
    return {
      x: (this.w() - Math.min(maxW, WORLD_W * scale)) / 2,
      y: top,
      w: Math.min(maxW, WORLD_W * scale),
      h: maxH,
      scale,
      cameraX,
      cameraY,
    };
  }

  private toScreen(layout: ReturnType<YuanboPixiGame['mapLayout']>, x: number, y: number): { x: number; y: number } {
    return { x: layout.x + (x - layout.cameraX) * layout.scale, y: layout.y + (y - layout.cameraY) * layout.scale };
  }

  private toWorld(layout: ReturnType<YuanboPixiGame['mapLayout']>, x: number, y: number): { x: number; y: number } {
    return { x: (x - layout.x) / layout.scale + layout.cameraX, y: (y - layout.y) / layout.scale + layout.cameraY };
  }

  private mobile(): boolean {
    return this.w() <= 720 && this.h() > this.w();
  }

  private w(): number {
    return this.app.screen.width;
  }

  private h(): number {
    return this.app.screen.height;
  }
}

function createTouchControls(root: HTMLElement): HTMLDivElement {
  const controls = document.createElement('div');
  controls.className = 'yrpg-touch-bridge';
  const stick = document.createElement('div');
  stick.className = 'yrpg-touch-bridge__stick';
  const knob = document.createElement('div');
  knob.className = 'yrpg-touch-bridge__knob';
  const interact = document.createElement('button');
  interact.type = 'button';
  interact.className = 'yrpg-touch-bridge__interact';
  interact.textContent = '互动';
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'yrpg-touch-bridge__menu';
  menu.textContent = '菜单';
  stick.appendChild(knob);
  controls.append(stick, interact, menu);
  root.appendChild(controls);

  let pointerId: number | null = null;
  const dispatchVector = (x: number, y: number) => {
    controls.dispatchEvent(new CustomEvent('yuanbo-vector', { detail: { x, y } }));
  };
  const release = () => {
    pointerId = null;
    knob.style.transform = 'translate(-50%, -50%)';
    dispatchVector(0, 0);
  };
  const update = (event: PointerEvent) => {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);
    const radius = Math.min(rect.width, rect.height) * 0.42;
    const nx = distance ? dx / distance : 0;
    const ny = distance ? dy / distance : 0;
    const amount = Math.min(1, distance / radius);
    knob.style.transform = `translate(calc(-50% + ${nx * amount * radius}px), calc(-50% + ${ny * amount * radius}px))`;
    dispatchVector(distance < 8 ? 0 : nx * amount, distance < 8 ? 0 : ny * amount);
  };
  stick.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pointerId = event.pointerId;
    try {
      stick.setPointerCapture(pointerId);
    } catch {
      // Browser fallback.
    }
    update(event);
  });
  stick.addEventListener('pointermove', (event) => {
    if (event.pointerId === pointerId) update(event);
  });
  stick.addEventListener('pointerup', release);
  stick.addEventListener('pointercancel', release);
  interact.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    controls.dispatchEvent(new CustomEvent('yuanbo-interact'));
  });
  menu.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    controls.dispatchEvent(new CustomEvent('yuanbo-menu'));
  });
  return controls;
}

function openSaveOverlay(
  state: SaveState,
  actions: { onImport: (state: SaveState) => void; onReset: () => void },
): void {
  document.querySelector('.yrpg-save-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'yrpg-save-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:16px;background:rgba(4,12,14,.72);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#fff8dc;';
  const panel = document.createElement('div');
  panel.style.cssText =
    'width:min(92vw,640px);border:3px solid #ffdf86;background:#12282d;padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.4);';
  const code = encodeSave(state);
  panel.innerHTML = `
    <h2 style="margin:0 0 10px;color:#ffe6a8;font-size:22px">存档 / 迁移</h2>
    <p style="margin:0 0 12px;line-height:1.6;font-size:13px">进度保存在本浏览器。复制迁移码可以换设备继续。</p>
    <textarea aria-label="存档迁移码" style="box-sizing:border-box;width:100%;min-height:128px;background:#0b1519;color:#fff8dc;border:1px solid rgba(255,223,134,.7);padding:10px;font:700 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${code}</textarea>
    <div data-error style="min-height:22px;margin-top:8px;color:#ffb6a9;font-size:12px;font-weight:800"></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px"></div>
  `;
  const textarea = panel.querySelector('textarea') as HTMLTextAreaElement;
  const error = panel.querySelector('[data-error]') as HTMLDivElement;
  const grid = panel.querySelector('div:last-child') as HTMLDivElement;
  const close = () => overlay.remove();
  const add = (text: string, fn: () => void) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.style.cssText =
      'min-height:42px;border:1px solid rgba(255,223,134,.75);background:#285d72;color:#fff8dc;font:900 13px/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;';
    button.addEventListener('click', fn);
    grid.appendChild(button);
  };
  add('复制', () => {
    navigator.clipboard?.writeText(textarea.value);
    error.textContent = '迁移码已复制。';
  });
  add('导入', () => {
    try {
      actions.onImport(decodeSave(textarea.value.trim()));
      close();
    } catch {
      error.textContent = '导入失败：需要完整 YBPIXI1 存档码。';
    }
  });
  add('重开', () => {
    actions.onReset();
    close();
  });
  add('关闭', close);
  overlay.append(panel);
  document.body.append(overlay);
}

function renderFatal(message: string): HTMLElement {
  const node = document.createElement('div');
  node.style.cssText = 'max-width:720px;padding:20px;border:2px solid #ffdf86;background:#12282d;color:#fff8dc;font:700 14px/1.6 ui-monospace,monospace;';
  node.textContent = `游戏启动失败：${message}`;
  return node;
}

function drawFacilityAsset(spot: Hotspot, scale: number): Container {
  const c = new Container();
  const w = spot.w * scale;
  const h = spot.h * scale;
  const u = (value: number) => value * scale;
  c.addChild(new Graphics().ellipse(w / 2, h + u(8), Math.max(u(34), w * 0.42), u(11)).fill({ color: 0x000000, alpha: 0.14 }));

  if (spot.id === 'board' || spot.id === 'site-board') {
    c.addChild(rect(0, 0, w, h, 0x244b52, 1, 0x163438));
    c.addChild(rect(u(8), u(8), w - u(16), h - u(16), 0xdff4f1, 1, 0x95c8c2));
    c.addChild(rect(u(18), u(18), u(34), u(22), 0xffdf86, 1));
    c.addChild(rect(u(58), u(16), u(30), u(28), 0xfff7df, 1));
    c.addChild(rect(u(96), u(18), u(28), u(22), 0x88d6bd, 1));
    c.addChild(rect(u(20), u(50), u(92), u(7), 0x2f6fb8, 1));
    c.addChild(rect(u(20), u(62), u(62), u(6), 0xc85d45, 1));
    c.addChild(new Graphics().circle(u(14), u(14), u(3)).fill(0xc85d45));
    c.addChild(new Graphics().circle(w - u(14), u(14), u(3)).fill(0xc85d45));
    return c;
  }

  if (spot.id === 'training') {
    c.addChild(rect(u(8), u(28), w - u(16), h - u(18), 0x9a6232, 1, 0x603a21));
    c.addChild(rect(u(24), u(6), u(68), u(44), 0x0d2f3a, 1, 0x7bd7e5));
    c.addChild(rect(u(31), u(13), u(54), u(29), 0x123f56, 1));
    c.addChild(rect(u(38), u(20), u(14), u(14), GREEN, 1));
    c.addChild(rect(u(58), u(18), u(20), u(6), GOLD, 1));
    c.addChild(rect(u(102), u(16), u(24), u(12), 0xf5f0d4, 1));
    c.addChild(rect(u(104), u(34), u(34), u(10), 0x20252a, 1));
    c.addChild(new Graphics().circle(u(112), u(58), u(5)).fill(BLUE));
    c.addChild(new Graphics().circle(u(130), u(58), u(5)).fill(RED));
    return c;
  }

  if (spot.id === 'prep' || spot.id === 'site-prep') {
    c.addChild(rect(u(8), u(34), w - u(16), u(42), 0x77522e, 1, 0x4f351f));
    c.addChild(rect(u(0), u(22), w, u(26), 0xb0733b, 1, 0x6d4225));
    c.addChild(rect(u(30), u(5), u(52), u(34), 0x11282d, 1, 0x72b9c5));
    c.addChild(rect(u(38), u(12), u(36), u(18), 0x1e6d82, 1));
    c.addChild(rect(u(92), u(11), u(42), u(28), 0xfff7df, 1, 0x9e7d44));
    c.addChild(rect(u(99), u(17), u(26), u(5), 0x2f6fb8, 1));
    c.addChild(rect(u(99), u(27), u(20), u(4), 0xc85d45, 1));
    c.addChild(rect(w - u(48), u(24), u(28), u(8), 0x263039, 1));
    if (spot.id === 'site-prep') {
      c.addChild(new Graphics().circle(w - u(84), u(20), u(7)).fill(0x263039));
      c.addChild(rect(w - u(88), u(26), u(8), u(22), 0x263039, 1));
    }
    return c;
  }

  if (spot.id === 'save' || spot.id === 'site-save') {
    c.addChild(rect(u(8), 0, w - u(16), h, 0x0f5558, 1, 0x68d9d2));
    [12, 28, 44, 60].forEach((y, index) => {
      c.addChild(rect(u(20), u(y), w - u(40), u(9), index % 2 ? 0x123138 : 0x173a43, 1));
      c.addChild(new Graphics().circle(w - u(30), u(y + 4), u(3)).fill(index % 2 ? GOLD : GREEN));
    });
    c.addChild(rect(u(30), h - u(18), u(28), u(18), 0x102324, 1));
    c.addChild(new Graphics().circle(w - u(52), h - u(16), u(10)).stroke({ color: 0x9cefe7, width: u(3), alpha: 0.9 }));
    c.addChild(new Graphics().circle(w - u(36), h - u(16), u(10)).stroke({ color: 0x9cefe7, width: u(3), alpha: 0.9 }));
    return c;
  }

  if (spot.id === 'debt') {
    c.addChild(rect(u(8), 0, w - u(16), h, 0x24323b, 1, 0xffb169));
    c.addChild(rect(u(22), u(16), w - u(44), u(10), 0xc85d45, 1));
    c.addChild(rect(u(22), u(36), w - u(66), u(8), 0xffdf86, 1));
    c.addChild(rect(u(22), u(54), w - u(82), u(8), 0x7db0ff, 1));
    c.addChild(new Graphics().circle(w - u(34), u(28), u(10)).fill(0xc85d45));
    c.addChild(new Graphics().circle(w - u(34), u(58), u(10)).fill(0xffdf86));
    return c;
  }

  if (spot.id === 'rest') {
    c.addChild(rect(u(8), u(28), w - u(16), u(38), 0x667cc2, 1, 0x3d4d85));
    c.addChild(rect(u(22), u(14), u(45), u(32), 0x8aa0e8, 1));
    c.addChild(rect(u(78), u(14), u(45), u(32), 0x8aa0e8, 1));
    c.addChild(rect(u(18), u(62), u(18), u(20), 0x303447, 1));
    c.addChild(rect(w - u(36), u(62), u(18), u(20), 0x303447, 1));
    c.addChild(new Graphics().circle(u(132), u(16), u(12)).fill(GOLD));
    c.addChild(rect(u(128), u(28), u(8), u(26), 0x5b4630, 1));
    return c;
  }

  if (spot.kind === 'portal') {
    c.addChild(rect(u(8), 0, w - u(16), h, 0x95d7c6, 0.82, GOLD));
    c.addChild(rect(u(16), u(12), w - u(32), h - u(24), 0xcaf5e9, 0.72, 0x74b8aa));
    c.addChild(rect(w / 2 - u(3), u(8), u(6), h - u(16), 0x74b8aa, 0.8));
    c.addChild(new Graphics().circle(w / 2 + u(14), h / 2, u(5)).fill(GOLD));
    c.addChild(centerLabel(spot.mapId === 'office' ? '客户现场' : '办公室', w / 2, -u(18), 11, CREAM, u(92), 0x173434));
    return c;
  }

  c.addChild(rect(0, 0, w, h, 0x285d72, 1, GOLD));
  return c;
}

function drawCustomerSprite(npc: Npc, scale: number): Container {
  const c = new Container();
  const s = scale;
  const skin = 0xf0c78e;
  const hair = npc.questId === 'shadow' ? 0x322033 : npc.questId === 'boss' ? 0x263039 : 0x182229;
  c.addChild(new Graphics().ellipse(0, 33 * s, 26 * s, 9 * s).fill({ color: 0x000000, alpha: 0.2 }));

  if (npc.questId === 'boss') {
    [-22, 0, 22].forEach((x, index) => {
      c.addChild(new Graphics().circle(x * s, (-28 - index * 2) * s, 13 * s).fill(skin));
      c.addChild(new Graphics().roundRect((x - 12) * s, (-42 - index * 2) * s, 24 * s, 10 * s, 4 * s).fill(hair));
      c.addChild(new Graphics().roundRect((x - 11) * s, (-14 + index * 2) * s, 22 * s, 36 * s, 5 * s).fill(index === 1 ? npc.color : 0x35495c));
      c.addChild(new Graphics().rect((x - 7) * s, (-29 - index * 2) * s, 5 * s, 2 * s).fill(SHADOW));
      c.addChild(new Graphics().rect((x + 3) * s, (-29 - index * 2) * s, 5 * s, 2 * s).fill(SHADOW));
    });
    c.addChild(rect(-36 * s, 14 * s, 72 * s, 14 * s, 0xaa7139, 1, 0x603a21));
    c.addChild(rect(-24 * s, 1 * s, 48 * s, 18 * s, 0xfff7df, 1, 0x9e7d44));
    return c;
  }

  c.addChild(new Graphics().roundRect(-9 * s, 16 * s, 8 * s, 19 * s, 3 * s).fill(0x20252a));
  c.addChild(new Graphics().roundRect(3 * s, 16 * s, 8 * s, 19 * s, 3 * s).fill(0x20252a));
  c.addChild(new Graphics().rect(-13 * s, 34 * s, 12 * s, 5 * s).fill(0xfff7df));
  c.addChild(new Graphics().rect(3 * s, 34 * s, 12 * s, 5 * s).fill(0xfff7df));
  c.addChild(new Graphics().roundRect(-18 * s, -10 * s, 36 * s, 34 * s, 8 * s).fill(npc.color));
  c.addChild(new Graphics().roundRect(-25 * s, -4 * s, 9 * s, 25 * s, 5 * s).fill(skin));
  c.addChild(new Graphics().roundRect(16 * s, -4 * s, 9 * s, 25 * s, 5 * s).fill(skin));
  c.addChild(new Graphics().rect(-8 * s, -8 * s, 16 * s, 26 * s).fill({ color: 0xffffff, alpha: 0.14 }));
  c.addChild(new Graphics().ellipse(0, -28 * s, 17 * s, 19 * s).fill(skin));
  c.addChild(new Graphics().roundRect(-15 * s, -44 * s, 30 * s, 12 * s, 6 * s).fill(hair));
  c.addChild(new Graphics().rect(-16 * s, -39 * s, 6 * s, 17 * s).fill(hair));
  if (npc.questId === 'agent' || npc.questId === 'cost') c.addChild(new Graphics().rect(10 * s, -39 * s, 6 * s, 18 * s).fill(hair));
  c.addChild(new Graphics().rect(-8 * s, -30 * s, 5 * s, 3 * s).fill(SHADOW));
  c.addChild(new Graphics().rect(4 * s, -30 * s, 5 * s, 3 * s).fill(SHADOW));
  c.addChild(new Graphics().rect(-5 * s, -19 * s, 10 * s, 3 * s).fill(0x8d4a3d));
  drawNpcProp(c, npc, s);
  return c;
}

function drawNpcProp(c: Container, npc: Npc, s: number): void {
  if (npc.questId === 'gpu') {
    c.addChild(rect(-35 * s, -2 * s, 18 * s, 22 * s, 0xfff7df, 1, 0x2f6fb8));
    c.addChild(rect(-32 * s, 3 * s, 12 * s, 4 * s, 0xc85d45, 1));
    c.addChild(rect(-32 * s, 11 * s, 9 * s, 3 * s, GOLD, 1));
  } else if (npc.questId === 'agent') {
    c.addChild(rect(21 * s, -12 * s, 16 * s, 20 * s, 0x102324, 1, GREEN));
    c.addChild(new Graphics().circle(29 * s, -2 * s, 4 * s).fill(GREEN));
  } else if (npc.questId === 'sla') {
    c.addChild(rect(18 * s, -19 * s, 13 * s, 24 * s, 0x0d2f3a, 1, 0x7db0ff));
    c.addChild(rect(21 * s, -14 * s, 7 * s, 4 * s, RED, 1));
  } else if (npc.questId === 'compliance') {
    c.addChild(rect(-34 * s, -5 * s, 20 * s, 28 * s, 0xffdf86, 1, 0x8c6d33));
    c.addChild(rect(-30 * s, 1 * s, 12 * s, 3 * s, 0x6870b5, 1));
  } else if (npc.questId === 'cost') {
    c.addChild(rect(18 * s, -8 * s, 19 * s, 25 * s, 0xfff7df, 1, 0x2d8a6f));
    c.addChild(rect(23 * s, 4 * s, 4 * s, 9 * s, GREEN, 1));
    c.addChild(rect(29 * s, -1 * s, 4 * s, 14 * s, GOLD, 1));
  } else if (npc.questId === 'shadow') {
    [-1, 0, 1].forEach((offset) => {
      c.addChild(rect((20 + offset * 8) * s, (-13 + Math.abs(offset) * 3) * s, 12 * s, 18 * s, offset ? 0xfff7df : GOLD, 1, 0x9a5fb5));
    });
  }
}

function rect(x: number, y: number, w: number, h: number, color: number, alpha = 1, stroke?: number): Graphics {
  const g = new Graphics();
  g.roundRect(x, y, w, h, 6).fill({ color, alpha });
  if (stroke !== undefined) g.roundRect(x, y, w, h, 6).stroke({ color: stroke, width: 2, alpha: 0.9 });
  return g;
}

function label(text: string, x: number, y: number, size: number, color: number, width: number, weight = '800', maxHeight?: number): Text {
  const safe = fitText(text, width, size, maxHeight);
  const t = new Text({
    text: safe,
    style: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: size,
      fontWeight: weight,
      fill: color,
      lineHeight: Math.round(size * 1.36),
      wordWrap: true,
      wordWrapWidth: width,
      breakWords: true,
    },
  });
  t.x = x;
  t.y = y;
  return t;
}

function centerLabel(text: string, x: number, y: number, size: number, color: number, width: number, bg?: number): Container {
  const t = label(text, 0, 0, size, color, width, '900');
  t.anchor.set(0.5);
  const c = new Container();
  if (bg !== undefined) {
    const padX = 8;
    const padY = 4;
    c.addChild(rect(-width / 2, -size / 2 - padY, width, size + padY * 2, bg, 0.96));
  }
  c.addChild(t);
  c.x = x;
  c.y = y;
  return c;
}

function button(
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  onClick: () => void,
  color: number,
  size = 12,
  disabled = false,
): Container {
  const c = new Container();
  c.x = x;
  c.y = y;
  c.eventMode = disabled ? 'none' : 'static';
  c.cursor = disabled ? 'default' : 'pointer';
  c.alpha = disabled ? 0.58 : 1;
  c.addChild(rect(0, 0, w, h, color, 0.98, GOLD));
  const t = label(text, 10, 0, size, CREAM, w - 20, '900', h - 8);
  t.y = (h - Math.min(t.height, h - 6)) / 2;
  c.addChild(t);
  c.on('pointertap', onClick);
  return c;
}

function bar(x: number, y: number, w: number, h: number, name: string, value: number, color: number): Container {
  const c = new Container();
  c.addChild(label(name, x, y - 1, 11, CREAM, 52, '900'));
  c.addChild(rect(x + 54, y, w - 54, h, 0x0b171a, 1, 0x2e4a4d));
  c.addChild(rect(x + 56, y + 2, Math.max(0, (w - 58) * clamp(value, 0, 100) / 100), h - 4, color, 0.95));
  c.addChild(label(String(Math.round(value)), x + w - 34, y + 1, 10, CREAM, 32, '900'));
  return c;
}

function battleActionIndex(skillId = ''): number {
  return {
    stabilize: 1,
    anchor: 2,
    report: 3,
    poc: 4,
    milestone: 5,
    split: 5,
    contract: 6,
    fallback: 7,
    slaExplain: 7,
    review: 8,
    shadow: 9,
    shadowReview: 9,
    bundle: 2,
  }[skillId] ?? 0;
}

function debtLine(state: SaveState): string {
  if (!state.issues.length) return '暂无';
  const total = state.issues.reduce((sum, issue) => sum + issue.severity, 0);
  const labels = state.issues
    .slice()
    .sort((a, b) => b.severity - a.severity)
    .map((issue) => `${issueKindLabel(issue.kind)}:${issue.label}${issue.severity}`)
    .join(' / ');
  return `${total}：${labels}`;
}

function issueKindLabel(kind: SaveState['issues'][number]['kind']): string {
  return {
    budget: '预算',
    delivery: '交付',
    sla: 'SLA',
    compliance: '合规',
    pressure: '压力',
  }[kind];
}

function fitText(text: string, width: number, size: number, maxHeight?: number): string {
  const chars = Math.max(8, Math.floor(width / (size * 0.86)));
  const maxLines = maxHeight ? Math.max(1, Math.floor(maxHeight / (size * 1.36))) : 18;
  const lines: string[] = [];
  text.split('\n').forEach((raw) => {
    let remaining = raw.trim();
    if (!remaining) {
      lines.push('');
      return;
    }
    while (remaining.length > chars) {
      lines.push(remaining.slice(0, chars));
      remaining = remaining.slice(chars);
    }
    lines.push(remaining);
  });
  if (lines.length <= maxLines) return lines.join('\n');
  return `${lines.slice(0, maxLines - 1).join('\n')}\n……`;
}

function shortIntent(skill: Skill): string {
  return skill.intent.replace(/[，。]/g, ' ').slice(0, 14);
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function distToRect(px: number, py: number, x: number, y: number, w: number, h: number): number {
  const dx = Math.max(x - px, 0, px - (x + w));
  const dy = Math.max(y - py, 0, py - (y + h));
  return Math.hypot(dx, dy);
}

function hotspotPriority(spot: Hotspot): number {
  if (spot.kind === 'prep') return 3;
  if (spot.kind === 'portal') return 2;
  return 1;
}
