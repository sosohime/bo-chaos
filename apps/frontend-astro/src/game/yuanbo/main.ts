import Phaser from 'phaser';
import {
  ACHIEVEMENTS,
  BOSS_DOCKET_CARDS,
  CASE_MEMORIES,
  CASE_VARIANTS,
  CONTRACT_STANCES,
  EVENTS,
  FIELD_OPERATIONS,
  GAME_H,
  GAME_W,
  HOTSPOTS,
  LEGACIES,
  LONG_TERM_GOALS,
  MAP_TOP,
  NPCS,
  QUESTS,
  ROUTE_MILESTONES,
  SKILLS,
  STORY_CARDS,
  TILE,
  TRAINING,
  WEEKLY_GOALS,
} from './data';
import {
  addLog,
  clamp,
  decodeSave,
  defaultState,
  encodeSave,
  levelUp,
  loadState,
  money,
  persistState,
  trainCost,
  xpNeed,
} from './state';
import type {
  BattleState,
  CaseVariantDefinition,
  ClientStats,
  ContractStanceDefinition,
  Direction,
  EventDefinition,
  FieldOperationDefinition,
  Issue,
  LongTermGoalDefinition,
  MapHotspot,
  MapId,
  Outcome,
  PerkId,
  QuestDefinition,
  RouteKey,
  SaveState,
  SkillDefinition,
  TrainingKey,
  WeeklyGoalDefinition,
} from './types';

type Shared = {
  expertBo: string;
  shadowBo: string;
  mapBo: string;
  getState: () => SaveState;
  setState: (next: SaveState) => void;
  save: () => void;
};

const BO_FRAME_W = 42;
const BO_FRAME_H = 58;
const SAVE_OK = '本地自动存档已写入。';
const PERK_LABELS: Record<PerkId, string> = {
  'quote-ledger': '报价台账：商业技能预算收益 +5',
  'poc-playbook': 'POC 剧本：交付技能信任收益 +5',
  'sla-shield': 'SLA 盾牌：失败遗留严重度 -3',
  'review-cleanup': '复盘清债：训练复盘额外清一项遗留',
  'shadow-clone': '影流分身：影流技能额外降压力',
  'boss-prep': '验收预案：Boss 前展示审判材料',
  'business-vow': '专精·姐别白嗦：商业技能预算收益更高，胜利收款 +12%',
  'delivery-vow': '专精·先验后吹：交付技能信任收益更高，部分成功少留锅',
  'boundary-vow': '专精·拉表关单：边界技能压蔓延更强，失败遗留更轻',
  'shadow-vow': '专精·影流三案：影流技能更强，Boss 质询会出现隐藏台词',
};
const TRAINING_PERKS: Record<
  TrainingKey,
  { level: number; id: PerkId; line: string }
> = {
  pricing: {
    level: 2,
    id: 'quote-ledger',
    line: '报价台账解锁：以后商业技能会更能守预算。',
  },
  delivery: {
    level: 2,
    id: 'poc-playbook',
    line: 'POC 剧本解锁：交付技能更容易换信任。',
  },
  sla: {
    level: 2,
    id: 'sla-shield',
    line: 'SLA 盾牌解锁：失败也不至于全锅扣头上。',
  },
  recovery: {
    level: 2,
    id: 'review-cleanup',
    line: '复盘清债解锁：复盘训练能多清一个烂摊子。',
  },
  shadow: {
    level: 2,
    id: 'shadow-clone',
    line: '影流分身解锁：三方案不只是花活，能降压力。',
  },
};
const CORE_REFRAINS = [
  '这姐咋收钱啊？先别玄学，先落表。',
  '不行姐再给你梳一次，但这次叫 POC、复盘、成本治理。',
  '再不行就拉表关单吧，不能免费续杯到天亮。',
];
const ROUTE_VOWS: Record<
  RouteKey,
  { id: PerkId; title: string; line: string }
> = {
  business: {
    id: 'business-vow',
    title: '姐别白嗦',
    line: '商业专精：这单咋收钱先说清，能送的叫情分，能收的叫套餐。',
  },
  delivery: {
    id: 'delivery-vow',
    title: '先验后吹',
    line: '交付专精：满意是啥？写表里。写不出来就别急头白脸。',
  },
  boundary: {
    id: 'boundary-vow',
    title: '拉表关单',
    line: '边界专精：不是不管，是别让我免费背锅。预案写上。',
  },
  shadow: {
    id: 'shadow-vow',
    title: '影流三案',
    line: '影流专精：A 稳 B 快 C 旗舰，客户选哪个都不是白送。',
  },
};

export function startYuanboGame(root: HTMLElement): () => void {
  let state = loadState();
  const gameSize = getInitialGameSize();
  const shared: Shared = {
    expertBo: root.dataset.boSrc || '/codex-pets/expertbo-cutout.png',
    shadowBo: root.dataset.shadowBoSrc || '/codex-pets/shadowbo-cutout.png',
    mapBo:
      root.dataset.mapBoSrc ||
      root.dataset.boSrc ||
      '/codex-pets/expertbo-cutout.png',
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    save: () => {
      persistState(state);
    },
  };

  root.replaceChildren();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: root,
    width: gameSize.width,
    height: gameSize.height,
    backgroundColor: '#102324',
    pixelArt: false,
    roundPixels: false,
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameSize.width,
      height: gameSize.height,
    },
    scene: [
      new BootScene(shared),
      new WorldScene(shared),
      new NegotiationScene(shared),
    ],
  });

  const touch = createTouchControls(root, game);
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)
    )
      return;
    if (event.key === ' ' && game.scene.isActive('WorldScene')) {
      event.preventDefault();
    }
  };
  const onResize = () => {
    const next = getInitialGameSize();
    game.scale.resize(next.width, next.height);
    const activeScene = game.scene.getScenes(true)[0] as
      | Phaser.Scene
      | undefined;
    if (activeScene?.scene.key === 'WorldScene')
      (activeScene as unknown as { drawWorld?: () => void }).drawWorld?.();
    if (activeScene?.scene.key === 'NegotiationScene')
      (activeScene as unknown as { draw?: () => void }).draw?.();
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  persistState(state);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    touch.remove();
    game.destroy(true);
  };
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
  let activePointerId: number | null = null;

  const setVector = (x: number, y: number) => {
    const world = game.scene.getScene('WorldScene') as unknown as {
      setVirtualVector?: (x: number, y: number) => void;
    };
    if (game.scene.isActive('WorldScene')) world.setVirtualVector?.(x, y);
  };
  const resetStick = () => {
    knob.style.transform = 'translate(-50%, -50%)';
    setVector(0, 0);
  };
  const updateStick = (event: PointerEvent) => {
    const rect = stick.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.42;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawX = event.clientX - cx;
    const rawY = event.clientY - cy;
    const distance = Math.hypot(rawX, rawY);
    const clamped = Math.min(radius, distance);
    const nx = distance > 0 ? rawX / distance : 0;
    const ny = distance > 0 ? rawY / distance : 0;
    const deadzone = 8;
    knob.style.transform = `translate(calc(-50% + ${nx * clamped}px), calc(-50% + ${ny * clamped}px))`;
    if (distance < deadzone) setVector(0, 0);
    else setVector(nx * (clamped / radius), ny * (clamped / radius));
  };

  stick.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    activePointerId = event.pointerId;
    try {
      stick.setPointerCapture(event.pointerId);
    } catch {
      // Some embedded browsers and synthetic checks do not expose capture for generated pointers.
    }
    updateStick(event);
  });
  stick.addEventListener('pointermove', (event) => {
    if (event.pointerId === activePointerId) updateStick(event);
  });
  const releaseStick = (event?: PointerEvent) => {
    if (
      event &&
      activePointerId !== null &&
      event.pointerId !== activePointerId
    )
      return;
    activePointerId = null;
    resetStick();
  };
  stick.addEventListener('pointerup', releaseStick);
  stick.addEventListener('pointercancel', releaseStick);
  stick.addEventListener('lostpointercapture', () => {
    activePointerId = null;
    resetStick();
  });
  stick.addEventListener('contextmenu', (event) => event.preventDefault());

  interact.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const world = game.scene.getScene('WorldScene') as unknown as {
      interact?: () => void;
    };
    if (game.scene.isActive('WorldScene')) world.interact?.();
  });

  controls.append(stick, interact);
  root.appendChild(controls);
  return controls;
}

class BootScene extends Phaser.Scene {
  constructor(private readonly shared: Shared) {
    super('BootScene');
  }

  preload(): void {
    this.load.image('expertBoPortrait', this.shared.expertBo);
    this.load.image('shadowBoPortrait', this.shared.shadowBo);
    this.load.image('expertBoMapPortrait', this.shared.mapBo);
  }

  create(): void {
    createBoCutoutTextures(this);
    createGameTextures(this);
    this.scene.start('WorldScene');
  }
}

class WorldScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private direction: Direction = 'down';
  private modal?: Phaser.GameObjects.Container;
  private modalHitZones: Phaser.GameObjects.GameObject[] = [];
  private modalDefaultAction?: () => void;
  private hud?: Phaser.GameObjects.Container;
  private hint?: Phaser.GameObjects.Text;
  private virtual = { x: 0, y: 0 };
  private moveVector = new Phaser.Math.Vector2(0, 0);
  private playerShadow?: Phaser.GameObjects.Ellipse;
  private npcSprites = new Map<string, Phaser.GameObjects.Container>();
  private hotspotRects = new Map<string, Phaser.GameObjects.Rectangle>();
  private lastNearId = '';
  private codexPage: 'overview' | 'goals' | 'achievements' | 'stories' =
    'overview';
  private loadoutPage = 0;
  private loadoutQuestId = '';

  constructor(private readonly shared: Shared) {
    super('WorldScene');
  }

  create(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys(
      'W,A,S,D,E,SPACE,ENTER,ESC,M,C',
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard?.on('keydown-E', () => this.interact());
    this.input.keyboard?.on('keydown-SPACE', () => this.interact());
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmModal());
    this.input.keyboard?.on('keydown-ESC', () => this.closeModal());
    this.input.keyboard?.on('keydown-M', () => this.showMenu());
    this.input.keyboard?.on('keydown-C', () => this.showCodex());
    this.drawWorld();
  }

  update(time: number, delta: number): void {
    this.updatePlayer(time, delta);
    this.updateHint();
  }

  private state(): SaveState {
    return this.shared.getState();
  }

  private save(): void {
    this.shared.save();
  }

  private viewW(): number {
    return this.scale.width;
  }

  private viewH(): number {
    return this.scale.height;
  }

  private isPortrait(): boolean {
    return this.viewW() < 720 && this.viewH() > this.viewW();
  }

  private worldH(): number {
    return Math.max(GAME_H, this.viewH());
  }

  private mapBottom(): number {
    return this.worldH() - 32;
  }

  private drawWorld(): void {
    document.querySelector('.yrpg-touch-bridge')?.removeAttribute('hidden');
    this.children.removeAll();
    this.npcSprites.clear();
    this.hotspotRects.clear();
    this.modal = undefined;
    this.modalHitZones = [];
    this.hud = undefined;

    const state = this.state();
    syncProgression(state);
    this.cameras.main.setBackgroundColor(
      state.mapId === 'office' ? '#163434' : '#1b263b',
    );
    this.physics.world.setBounds(0, MAP_TOP, GAME_W, this.worldH() - MAP_TOP);
    this.drawMapBack(state.mapId);
    this.createHotspots();
    this.createNpcs();
    this.createPlayer();
    this.createHud();
    this.hint = this.add
      .text(
        this.viewW() / 2,
        this.isPortrait() ? this.viewH() - 190 : this.viewH() - 18,
        this.isPortrait()
          ? '方向键移动，点互动'
          : 'WASD/方向键移动，E/空格互动',
        pixelText(13, '#fff4d7', '900'),
      )
      .setOrigin(0.5)
      .setDepth(80)
      .setScrollFactor(0);
    if (state.mapId === 'office' && !state.storyIntroSeen) {
      state.storyIntroSeen = true;
      addLog(
        state,
        '开场：客户姐把云账单拍到桌上，博哥决定把免费售后改造成可收费经营。',
      );
      this.showStoryIntro();
    }
    this.save();
  }

  private showStoryIntro(): void {
    this.showDialog(
      '开场：这单咋收钱',
      [
        '客户姐把账单、SLA、Agent 上线和合规材料一起拍到桌上。',
        ...CORE_REFRAINS,
        '从今天开始，白天接客户，晚上练报价、交付、SLA、复盘和影流。人这辈子，售后也得经营。',
      ].join('\n'),
      [{ label: '开门接单', onClick: () => this.closeModal() }],
      'event',
    );
  }

  private drawMapBack(mapId: MapId): void {
    const worldH = this.worldH();
    const floor = mapId === 'office' ? 0xeed9b2 : 0xd4e5e9;
    const path = mapId === 'office' ? 0xf7c878 : 0xb7cfdb;
    const wall = mapId === 'office' ? 0x244a48 : 0x253a54;
    this.add
      .rectangle(GAME_W / 2, MAP_TOP / 2, GAME_W, MAP_TOP, 0x0f2021)
      .setDepth(0);
    for (let y = MAP_TOP; y < worldH; y += TILE) {
      for (let x = 0; x < GAME_W; x += TILE) {
        const isPath =
          mapId === 'office'
            ? y > 330 || (x > 280 && x < 700 && y > 190)
            : y > 315 || (x > 380 && x < 570) || (y > 145 && y < 210);
        this.add
          .image(
            x + 16,
            y + 16,
            isPath
              ? 'tilePath'
              : mapId === 'office'
                ? 'tileOffice'
                : 'tileSite',
          )
          .setDepth(1);
      }
    }
    this.add.rectangle(GAME_W / 2, MAP_TOP + 13, GAME_W, 26, wall).setDepth(2);
    this.add.rectangle(GAME_W / 2, worldH - 14, GAME_W, 28, wall).setDepth(2);
    this.add
      .rectangle(13, (MAP_TOP + worldH) / 2, 26, worldH - MAP_TOP, wall)
      .setDepth(2);
    this.add
      .rectangle(
        GAME_W - 13,
        (MAP_TOP + worldH) / 2,
        26,
        worldH - MAP_TOP,
        wall,
      )
      .setDepth(2);

    if (mapId === 'office') {
      this.drawDecor(144, 104, '任务板', 'whiteboard', 110, 58);
      this.drawDecor(72, 194, '服务器墙', 'server', 150, 64);
      this.drawDecor(714, 112, '训练台', 'desk', 136, 62);
      this.drawDecor(438, 124, '会议室', 'screen', 170, 74);
      this.drawDecor(760, 408, '收工复盘', 'sofa', 120, 56);
      this.drawDecor(70, 398, '存档终端', 'terminal', 100, 56);
      this.drawPortal(892, 286, '客户现场');
    } else {
      this.drawDecor(386, 92, '验收议程', 'whiteboard', 186, 56);
      this.drawDecor(356, 206, '老板席', 'desk', 250, 66);
      this.drawDecor(640, 118, '大屏幕', 'screen', 180, 86);
      this.drawDecor(780, 342, '安全合规角', 'server', 126, 66);
      this.drawDecor(808, 404, '会议存档', 'terminal', 108, 54);
      this.drawPortal(64, 286, '回办公室');
    }

    this.add.rectangle(GAME_W / 2, worldH - 1, GAME_W, 2, floor).setDepth(3);
    this.add.rectangle(GAME_W / 2, MAP_TOP + 1, GAME_W, 2, path).setDepth(3);
  }

  private drawDecor(
    x: number,
    y: number,
    label: string,
    texture: string,
    w: number,
    h: number,
  ): void {
    const key = `decor-${texture}`;
    this.add
      .image(x + w / 2, y + h / 2, key)
      .setDisplaySize(w, h)
      .setDepth(4);
    this.add
      .text(x + w / 2, y - 6, label, pixelText(12, '#fff4d7', '900', '#173434'))
      .setOrigin(0.5)
      .setDepth(7);
  }

  private drawPortal(x: number, y: number, label: string): void {
    this.add
      .rectangle(x, y, 52, 86, 0x2ed09b, 0.26)
      .setStrokeStyle(2, 0xf8d76a)
      .setDepth(4);
    this.add
      .text(x, y - 55, label, pixelText(12, '#fff4d7', '900', '#173434'))
      .setOrigin(0.5)
      .setDepth(7);
  }

  private createHotspots(): void {
    const state = this.state();
    HOTSPOTS[this.state().mapId].forEach((spot) => {
      const rect = this.add
        .rectangle(
          spot.x + spot.w / 2,
          spot.y + spot.h / 2,
          spot.w,
          spot.h,
          0xffffff,
          0.001,
        )
        .setDepth(6)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (!this.modal) this.handleHotspot(spot);
        });
      this.hotspotRects.set(spot.id, rect);
      if (spot.type === 'field') {
        const ops = fieldOperationsFor(state, spot);
        const ready = ops.filter(
          (operation) =>
            operation.unlock(state) && !fieldOperationDone(state, operation),
        );
        const unlocked = ops.some((operation) => operation.unlock(state));
        const label = ready.length
          ? `${routeShort(ready[0].route)} ${ready.length}`
          : unlocked
            ? '已处理'
            : '未解锁';
        const color = ready.length
          ? `#${routeColor(ready[0].route).toString(16).padStart(6, '0')}`
          : unlocked
            ? '#3b6d59'
            : '#5a5b5f';
        const text = this.add
          .text(
            spot.x + spot.w / 2,
            spot.y + spot.h + 10,
            label,
            pixelText(10, '#fff8dc', '900', color),
          )
          .setOrigin(0.5)
          .setDepth(7);
        this.tweens.add({
          targets: text,
          y: text.y + 3,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    });
  }

  private createNpcs(): void {
    const state = this.state();
    NPCS.filter((npc) => npc.mapId === state.mapId).forEach((npc, index) => {
      const quest = questById(npc.questId);
      if (!quest || !quest.unlock(state)) return;
      const done = state.completed.includes(quest.id);
      const failed = state.failed.includes(quest.id);
      const container = this.add.container(npc.x, npc.y).setDepth(18);
      const shadow = this.add.ellipse(3, 20, 30, 10, 0x000000, 0.18);
      const sprite = this.add
        .sprite(0, 0, quest.boss ? 'bossNpc' : `npc-${index % 5}`)
        .setTint(npc.tint);
      sprite.setAlpha(done ? 0.42 : 1);
      const bubbleText = done
        ? 'OK'
        : quest.boss
          ? 'BOSS'
          : failed
            ? '!'
            : 'NEW';
      const bubble = this.add
        .text(
          0,
          -40,
          bubbleText,
          pixelText(
            11,
            '#fff8dc',
            '900',
            quest.boss ? '#8e334d' : failed ? '#ad4d36' : '#2368ad',
          ),
        )
        .setOrigin(0.5);
      const roleIcon = this.add
        .text(
          21,
          -16,
          questIcon(quest.id),
          pixelText(12, '#fff8dc', '900', '#14292d'),
        )
        .setOrigin(0.5);
      const name = this.add
        .text(0, 34, npc.name, pixelText(11, '#18302f', '900', '#fff7df'))
        .setOrigin(0.5);
      const hit = this.add
        .rectangle(0, 0, 78, 96, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (!this.modal && !done) this.showQuestBrief(quest);
        });
      container.add([hit, shadow, sprite, bubble, roleIcon, name]);
      this.tweens.add({
        targets: bubble,
        y: -43,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.npcSprites.set(npc.id, container);
    });
  }

  private createPlayer(): void {
    const point = this.state().player[this.state().mapId];
    const boDisplayH = this.isPortrait() ? 132 : 124;
    this.playerShadow = this.add
      .ellipse(point.x + 2, point.y + boDisplayH * 0.38, 44, 13, 0x000000, 0.22)
      .setDepth(19);
    this.player = this.physics.add
      .image(point.x, point.y, 'expertBoMapCutout')
      .setDepth(25);
    setImageFit(this.player, this.isPortrait() ? 96 : 90, boDisplayH);
    this.player.setCollideWorldBounds(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(36, 36, true);
    this.add
      .text(
        point.x,
        point.y - boDisplayH * 0.54,
        '博哥',
        pixelText(12, '#fff8dc', '900', '#185c9f'),
      )
      .setName('boName')
      .setOrigin(0.5)
      .setDepth(30);
    if (this.isPortrait()) {
      this.cameras.main.setBounds(0, 0, GAME_W, this.worldH());
      this.cameras.main.startFollow(this.player, true, 0.09, 0.09, 0, 72);
      this.cameras.main.setDeadzone(this.viewW() * 0.18, this.viewH() * 0.18);
    } else {
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
    }
  }

  private createHud(): void {
    const state = this.state();
    const vw = this.viewW();
    const mobile = this.isPortrait();
    this.hud = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
    const topH = mobile ? 74 : 50;
    const top = this.add
      .rectangle(vw / 2, topH / 2, vw, topH, 0x101e20, 0.97)
      .setStrokeStyle(1, 0x406b64);
    const title = this.add.text(
      mobile ? 78 : 16,
      mobile ? 7 : 9,
      mobile ? `DAY ${state.day} / 周目 ${state.cycle}` : '袁博の极限售后',
      pixelText(mobile ? 13 : 17, '#ffe6a8', '900'),
    );
    const day = this.add.text(
      mobile ? 78 : 244,
      mobile ? 27 : 10,
      mobile
        ? `行动 ${state.actionPoints}/3  ${money(state.stats.cash)}  Lv.${state.level}`
        : `DAY ${state.day} / 周目 ${state.cycle}`,
      pixelText(13, '#d8f6ed', '900'),
    );
    const ap = this.add
      .text(
        382,
        10,
        `行动 ${state.actionPoints}/3`,
        pixelText(13, '#d8f6ed', '900'),
      )
      .setVisible(!mobile);
    const cash = this.add
      .text(486, 10, money(state.stats.cash), pixelText(13, '#f8d76a', '900'))
      .setVisible(!mobile);
    const level = this.add
      .text(
        610,
        10,
        `Lv.${state.level} XP ${state.xp}/${xpNeed(state.level)}`,
        pixelText(13, '#d8f6ed', '900'),
      )
      .setVisible(!mobile);
    const status = this.add
      .text(
        10,
        mobile ? 49 : 31,
        this.statusLine(mobile),
        pixelText(mobile ? 10 : 11, '#cbe5dd', '700'),
      )
      .setWordWrapWidth(vw - (mobile ? 20 : 32));
    const save = this.makeButton(
      vw - (mobile ? 74 : 114),
      mobile ? 8 : 8,
      mobile ? 64 : 88,
      mobile ? 44 : 32,
      mobile ? '菜单' : '菜单/存档',
      () => this.showMenu(),
      0x294e58,
      mobile ? 11 : 12,
    );
    this.hud.add([top, title, day, ap, cash, level, status, save]);
  }

  private updatePlayer(time: number, delta: number): void {
    if (!this.player || this.modal) {
      this.player?.setVelocity(0, 0);
      this.moveVector.set(0, 0);
      return;
    }
    const keyX =
      Number(this.cursors?.right.isDown || this.keys?.D.isDown) -
      Number(this.cursors?.left.isDown || this.keys?.A.isDown);
    const keyY =
      Number(this.cursors?.down.isDown || this.keys?.S.isDown) -
      Number(this.cursors?.up.isDown || this.keys?.W.isDown);
    const target = new Phaser.Math.Vector2(
      this.virtual.x || keyX,
      this.virtual.y || keyY,
    );
    const amount = clamp(target.length(), 0, 1);
    if (target.lengthSq() > 0)
      target
        .normalize()
        .scale((this.isPortrait() ? 420 : 360) * Math.max(0.72, amount));
    const alpha = 1 - Math.pow(0.00003, Math.max(0, delta) / 1000);
    this.moveVector.lerp(target, clamp(alpha, 0.18, 0.56));
    if (target.lengthSq() === 0 && this.moveVector.length() < 7)
      this.moveVector.set(0, 0);

    if (this.moveVector.lengthSq() > 0) {
      if (Math.abs(this.moveVector.x) > Math.abs(this.moveVector.y))
        this.direction = this.moveVector.x < 0 ? 'left' : 'right';
      else this.direction = this.moveVector.y < 0 ? 'up' : 'down';
      this.player.setFlipX(this.direction === 'left');
      this.playerShadow?.setScale(1 + Math.sin(time / 95) * 0.05, 1);
    } else {
      this.player.setAngle(0);
      this.playerShadow?.setScale(1, 1);
    }
    this.player.setVelocity(this.moveVector.x, this.moveVector.y);
    this.keepOutOfDecor();
    const point = this.state().player[this.state().mapId];
    point.x = Math.round(this.player.x);
    point.y = Math.round(this.player.y);
    const label = this.children.getByName(
      'boName',
    ) as Phaser.GameObjects.Text | null;
    const boDisplayH = this.isPortrait() ? 136 : 128;
    label?.setPosition(this.player.x, this.player.y - boDisplayH * 0.54);
    this.playerShadow?.setPosition(
      this.player.x + 2,
      this.player.y + boDisplayH * 0.38,
    );
  }

  setVirtualVector(x: number, y: number): void {
    this.virtual.x = clamp(x, -1, 1);
    this.virtual.y = clamp(y, -1, 1);
  }

  setVirtual(direction: Direction, active: boolean): void {
    const value = active ? 1 : 0;
    if (direction === 'left') this.setVirtualVector(-value, this.virtual.y);
    if (direction === 'right') this.setVirtualVector(value, this.virtual.y);
    if (direction === 'up') this.setVirtualVector(this.virtual.x, -value);
    if (direction === 'down') this.setVirtualVector(this.virtual.x, value);
  }

  private keepOutOfDecor(): void {
    if (!this.player) return;
    this.player.x = clamp(this.player.x, 34, GAME_W - 34);
    this.player.y = clamp(this.player.y, MAP_TOP + 44, this.mapBottom());
    mapBlockers(this.state().mapId).forEach((rect) =>
      pushOutOfRect(this.player!, rect),
    );
  }

  private updateHint(): void {
    if (!this.hint || !this.player) return;
    const near = this.findNear();
    if (near.id === this.lastNearId) return;
    this.lastNearId = near.id;
    this.hotspotRects.forEach((rect, id) => {
      if (near.hotspot?.id === id) {
        rect.setFillStyle(0xf8d76a, 0.14).setStrokeStyle(2, 0xf8d76a, 0.75);
      } else {
        rect.setFillStyle(0xffffff, 0.001).setStrokeStyle();
      }
    });
    this.npcSprites.forEach((container) => container.setScale(1));
    const label = this.children.getByName(
      'boName',
    ) as Phaser.GameObjects.Text | null;
    label?.setVisible(!near.npc);
    this.hint.setText(
      near.label
        ? `靠近 ${near.label}，${this.isPortrait() ? '点互动' : '按 E/空格互动'}`
        : this.isPortrait()
          ? '方向键移动，点互动'
          : 'WASD/方向键移动，E/空格互动',
    );
  }

  private findNear(): {
    id: string;
    label: string;
    npc?: (typeof NPCS)[number];
    hotspot?: MapHotspot;
  } {
    if (!this.player) return { id: '', label: '' };
    const state = this.state();
    const nearNpc = NPCS.find((npc) => {
      const quest = questById(npc.questId);
      if (
        !quest ||
        npc.mapId !== state.mapId ||
        !quest.unlock(state) ||
        state.completed.includes(quest.id)
      )
        return false;
      return (
        Phaser.Math.Distance.Between(
          this.player!.x,
          this.player!.y,
          npc.x,
          npc.y,
        ) < 58
      );
    });
    if (nearNpc) return { id: nearNpc.id, label: nearNpc.name, npc: nearNpc };
    const nearSpot = HOTSPOTS[state.mapId].find((spot) => {
      const cx = spot.x + spot.w / 2;
      const cy = spot.y + spot.h / 2;
      return (
        Phaser.Math.Distance.Between(this.player!.x, this.player!.y, cx, cy) <
        Math.max(spot.w, spot.h) * 0.72
      );
    });
    if (nearSpot)
      return { id: nearSpot.id, label: nearSpot.label, hotspot: nearSpot };
    return { id: '', label: '' };
  }

  interact(): void {
    if (this.modal) return;
    const near = this.findNear();
    if (near.npc) {
      const quest = questById(near.npc.questId);
      if (quest) this.showQuestBrief(quest);
      return;
    }
    if (!near.hotspot) {
      this.toast('附近没有客户或设施。');
      return;
    }
    this.handleHotspot(near.hotspot);
  }

  private handleHotspot(hotspot: MapHotspot): void {
    if (hotspot.type === 'portal') this.switchMap();
    if (hotspot.type === 'training') this.showTraining();
    if (hotspot.type === 'board') this.showBoard();
    if (hotspot.type === 'rest') this.restToNextDay();
    if (hotspot.type === 'save') this.showMenu();
    if (hotspot.type === 'field') this.showFieldOperations(hotspot);
  }

  private showQuestBrief(quest: QuestDefinition): void {
    const state = this.state();
    syncProgression(state);
    const lockedUntil = state.locks[quest.id] || 0;
    const locked = lockedUntil > state.day;
    const blocked = state.actionPoints < quest.cost || locked;
    const memory = questMemoryLine(state, quest);
    const variant = activeCaseVariant(state, quest);
    const bossDocket = quest.boss ? bossDocketLine(state) : '';
    const stance = selectedStance(state);
    const body = [
      `${quest.arc} · ${chapterTitle(state.chapter)}`,
      quest.intro,
      variant
        ? `今日变体：${variant.title}\n${variant.introLine}\n影响：${caseVariantEffectLine(variant)}`
        : '',
      `当前策略：${stance.title}。${stance.line}`,
      memory,
      '',
      `目标：${quest.objective}`,
      `客户特质：${quest.traits.join(' / ')}`,
      `推荐 Lv.${quest.recommendedLevel} / 消耗行动 ${quest.cost} / 奖励 ${money(quest.reward)} / ${quest.xp} XP`,
      quest.boss
        ? bossDocket ||
          `Boss 会吃到当前 ${state.issues.length} 个遗留问题加成。`
        : state.failed.includes(quest.id)
          ? '这单失败过，客户冻结过一天；重试会更难，但奖励还在。'
          : '',
      locked
        ? `客户正在拉群冷静，DAY ${lockedUntil} 后才能重试。`
        : state.actionPoints < quest.cost
          ? '今天行动点不够，先收工或处理别的事。'
          : '',
    ]
      .filter(Boolean)
      .join('\n');
    this.showDialog(
      quest.title,
      body,
      [
        {
          label: locked
            ? '客户冷却中'
            : state.actionPoints < quest.cost
              ? '行动不足'
              : '进入谈判',
          disabled: blocked,
          onClick: () => {
            this.closeModal();
            this.scene.start('NegotiationScene', { questId: quest.id });
          },
        },
        {
          label: `策略：${stance.title}`,
          onClick: () => this.showStanceMenu(quest.id),
        },
        {
          label: refusedReviewDone(state, quest.id) ? '本周已复盘' : '拒单复盘',
          disabled:
            quest.boss ||
            state.actionPoints <= 0 ||
            refusedReviewDone(state, quest.id) ||
            !availableStances(state).some(
              (item) => item.id === 'hard-boundary',
            ),
          onClick: () => this.refuseQuest(quest),
        },
        {
          label: '按这单调装配',
          onClick: () => this.showSkillLoadout(quest.id),
        },
        { label: '再看看', onClick: () => this.closeModal() },
      ],
      quest.boss ? 'boss' : 'quest',
    );
  }

  private refuseQuest(quest: QuestDefinition): void {
    if (quest.boss) return;
    const state = this.state();
    if (
      state.actionPoints <= 0 ||
      refusedReviewDone(state, quest.id) ||
      !availableStances(state).some((item) => item.id === 'hard-boundary')
    )
      return;
    state.actionPoints -= 1;
    state.locks[quest.id] = state.day + 1;
    state.stats.pressure = clamp(state.stats.pressure - 12, 0, 100);
    state.stats.reputation = clamp(state.stats.reputation - 4, 0, 100);
    state.routes.boundary = clamp(state.routes.boundary + 7, 0, 100);
    state.xp += 8;
    state.relationships[quest.id] = clamp(
      (state.relationships[quest.id] || 0) - 8,
      -50,
      100,
    );
    state.storyFlags.push(refusedReviewFlag(state, quest.id));
    state.issues.unshift({
      id: `${quest.id}-refuse-${Date.now()}`,
      sourceQuest: quest.id,
      label: '客户被放鸽子的追问',
      type: 'pressure',
      severity: 4,
    });
    state.issues = state.issues.slice(0, 6);
    addLog(
      state,
      `拒单复盘：${quest.title} 今天先不接，边界写清了，但客户关系掉了一截。`,
    );
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    this.save();
    this.drawWorld();
    this.showBoard();
  }

  private showFieldOperations(hotspot: MapHotspot): void {
    const state = this.state();
    syncProgression(state);
    const operations = fieldOperationsFor(state, hotspot);
    const active = operations.filter(
      (operation) =>
        operation.unlock(state) && !fieldOperationDone(state, operation),
    );
    const lines = operations.length
      ? operations
          .map((operation) => {
            const done = fieldOperationDone(state, operation);
            const locked = operation.unlock(state)
              ? ''
              : ` / ${operation.unlockHint}`;
            const clear = operation.clearIssueType
              ? ` / 可清${issueTypeLabel(operation.clearIssueType)}遗留`
              : '';
            const risk = operation.issue
              ? ` / 风险：${operation.issue.label}`
              : '';
            return `${done ? '已处理' : operation.unlock(state) ? '可处理' : '锁定'} · ${routeLabel(operation.route)} · 行动${operation.cost} · ${operation.title}${clear}${risk}\n${operation.line}${locked}`;
          })
          .join('\n')
      : '这个地点今天没有可处理的现场操作。';
    const options = active.map((operation) => ({
      label: `${operation.title} · 行动${operation.cost}`,
      disabled: state.actionPoints < operation.cost,
      onClick: () => this.performFieldOperation(operation, hotspot),
    }));
    this.showDialog(
      hotspot.label,
      `现场操作会消耗行动点。它不替代客户谈判，但会改变遗留、路线、客户关系和 Boss 准备。\n\n${lines}`,
      [...options, { label: '离开', onClick: () => this.closeModal() }],
      'training',
    );
  }

  private performFieldOperation(
    operation: FieldOperationDefinition,
    hotspot: MapHotspot,
  ): void {
    const state = this.state();
    if (
      !operation.unlock(state) ||
      state.actionPoints < operation.cost ||
      fieldOperationDone(state, operation)
    )
      return;
    state.actionPoints -= operation.cost;
    applyStatEffect(state, { effect: operation.effect });
    state.xp += operation.xp;
    state.routes[operation.route] = clamp(
      state.routes[operation.route] + operation.routeGain,
      0,
      100,
    );
    state.storyFlags.push(fieldOperationKey(state, operation));
    if (operation.relationshipQuestId) {
      state.relationships[operation.relationshipQuestId] = clamp(
        (state.relationships[operation.relationshipQuestId] || 0) +
          (operation.relationshipGain || 0),
        -50,
        100,
      );
    }
    const cleared = clearFieldIssue(state, operation.clearIssueType);
    if (operation.issue) {
      state.issues.unshift({
        id: `field-${operation.id}-${Date.now()}`,
        sourceQuest: operation.id,
        ...operation.issue,
      });
      state.issues = state.issues.slice(0, 6);
    }
    addLog(
      state,
      `现场操作：${operation.title}。${operation.successLine}${cleared ? ` 清理了「${cleared.label}」。` : ''}`,
    );
    levelUp(state).forEach((line) => addLog(state, line));
    syncProgression(state);
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    this.save();
    this.drawWorld();
    this.showFieldOperations(hotspot);
  }

  private showTraining(): void {
    const state = this.state();
    const trainOptions = Object.entries(TRAINING).map(([key, meta]) => {
      const trainingKey = key as TrainingKey;
      const cost = trainCost(state.level, state.training[trainingKey]);
      const perk = TRAINING_PERKS[trainingKey];
      const perkText = state.perks.includes(perk.id)
        ? '已开特质'
        : `Lv.${perk.level} 解锁`;
      return {
        label: `${meta.name} Lv.${state.training[trainingKey]}  ${money(cost)} · ${perkText}`,
        disabled: state.actionPoints <= 0 || state.stats.cash < cost,
        onClick: () => this.train(trainingKey),
      };
    });
    const canChooseVow = availableRouteVows(state).length > 0;
    const perks = state.perks.length
      ? state.perks.map((id) => `· ${PERK_LABELS[id]}`).join('\n')
      : '还没有特质。训练到 Lv.2 会开始改变构筑。';
    const vowLine =
      routeVowSlots(state) > routeVows(state).length
        ? `可选经营专精 ${routeVows(state).length}/${routeVowSlots(state)}：专精会改变技能、结算和 Boss 质询。`
        : `经营专精已定：${
            routeVows(state)
              .map((route) => ROUTE_VOWS[route].title)
              .join(' / ') || '暂无'
          }`;
    const loadout =
      equippedSkillIds(state)
        .map((id) => skillById(id)?.name)
        .filter(Boolean)
        .join(' / ') || '自动带基础技能';
    const weekly = selectedWeeklyGoal(state);
    this.showDialog(
      '训练台',
      `每次训练消耗 1 行动。训练线会强化谈判技能，并解锁构筑特质。\n${vowLine}\n本周 OKR：${weekly ? `${weekly.title} ${weeklyGoalProgress(state, weekly)}/${weekly.target}` : '未承诺，Boss 不惩罚也不领奖'}\n当前装配：${loadout}\n\n当前特质：\n${perks}`,
      [
        { label: '技能装配', onClick: () => this.showSkillLoadout() },
        { label: '选择本周 OKR', onClick: () => this.showWeeklyGoalMenu() },
        {
          label: canChooseVow ? '选择经营专精' : '专精未开放',
          disabled: !canChooseVow,
          onClick: () => this.showRouteVowMenu(),
        },
        ...trainOptions,
        { label: '离开', onClick: () => this.closeModal() },
      ],
      'training',
    );
  }

  private showSkillLoadout(questId = this.loadoutQuestId): void {
    const state = this.state();
    this.loadoutQuestId = questId;
    const quest = questById(questId);
    normalizeEquippedSkills(state);
    const unlocked = sortedUnlockedSkills(state, quest || undefined).slice(
      0,
      18,
    );
    const equipped = equippedSkillIds(state);
    const slots = skillSlots(state);
    const pageSize = 4;
    const maxPage = Math.max(0, Math.ceil(unlocked.length / pageSize) - 1);
    this.loadoutPage = clamp(this.loadoutPage, 0, maxPage);
    const page = unlocked.slice(
      this.loadoutPage * pageSize,
      this.loadoutPage * pageSize + pageSize,
    );
    const body = [
      `技能装配 ${equipped.length}/${slots} · 第 ${this.loadoutPage + 1}/${maxPage + 1} 组。谈判只带装配技能，练出来也得装上。`,
      quest
        ? `当前按「${quest.title}」排序：${quest.traits.join(' / ')}`
        : '当前按通用经营构筑排序。',
      `已装：${
        equipped
          .map((id) => skillById(id)?.name)
          .filter(Boolean)
          .join(' / ') || '暂无'
      }`,
      '取舍就是经营：带报价，可能收得住钱；带边界，可能少背锅；带影流，可能把会开成三套方案。',
    ].join('\n');
    this.showDialog(
      '技能装配',
      body,
      [
        ...page.map((skill) => ({
          label: `${equipped.includes(skill.id) ? '卸下' : '装上'} ${skill.name}`,
          disabled: !equipped.includes(skill.id) && equipped.length >= slots,
          onClick: () => this.toggleSkillEquip(skill.id),
        })),
        {
          label: '上一组',
          disabled: this.loadoutPage <= 0,
          onClick: () => {
            this.loadoutPage -= 1;
            this.showSkillLoadout();
          },
        },
        {
          label: '下一组',
          disabled: this.loadoutPage >= maxPage,
          onClick: () => {
            this.loadoutPage += 1;
            this.showSkillLoadout();
          },
        },
        {
          label: quest ? '按这单推荐' : '自动推荐',
          onClick: () => this.autoEquipSkills(this.loadoutQuestId),
        },
        {
          label: quest ? '返回客户简报' : '返回训练台',
          onClick: () => {
            if (quest) this.showQuestBrief(quest);
            else this.showTraining();
          },
        },
      ],
      'training',
    );
  }

  private showStanceMenu(questId = ''): void {
    const state = this.state();
    const quest = questById(questId);
    const stances = availableStances(state);
    const current = selectedStance(state);
    const body = [
      quest
        ? `当前客户：${quest.title} · ${quest.traits.join(' / ')}`
        : '选择今天的谈判姿势。',
      `当前策略：${current.title}。${current.line}`,
      '',
      ...CONTRACT_STANCES.map(
        (stance) =>
          `${stances.some((item) => item.id === stance.id) ? '可用' : '锁定'} · ${stance.title}：${stance.line}${stances.some((item) => item.id === stance.id) ? '' : ` / ${stance.unlockHint}`}`,
      ),
    ].join('\n');
    this.showDialog(
      '谈判策略',
      body,
      [
        ...CONTRACT_STANCES.map((stance) => ({
          label: stance.id === current.id ? `${stance.title} ✓` : stance.title,
          disabled: !stances.some((item) => item.id === stance.id),
          onClick: () => this.chooseStance(stance.id, questId),
        })),
        {
          label: quest ? '返回客户简报' : '关闭',
          onClick: () => {
            if (quest) this.showQuestBrief(quest);
            else this.closeModal();
          },
        },
      ],
      'training',
    );
  }

  private chooseStance(stanceId: string, questId = ''): void {
    const state = this.state();
    if (!availableStances(state).some((stance) => stance.id === stanceId))
      return;
    const stance = stanceById(stanceId);
    if (!stance) return;
    state.contractStanceId = stance.id;
    addLog(state, `谈判策略：${stance.title}。${stance.line}`);
    this.save();
    this.showStanceMenu(questId);
  }

  private toggleSkillEquip(skillId: string): void {
    const state = this.state();
    normalizeEquippedSkills(state);
    const equipped = equippedSkillIds(state);
    if (equipped.includes(skillId)) {
      state.equippedSkills = equipped.filter((id) => id !== skillId);
      addLog(state, `卸下技能：${skillById(skillId)?.name || skillId}。`);
    } else if (equipped.length < skillSlots(state)) {
      state.equippedSkills = [...equipped, skillId];
      addLog(state, `装上技能：${skillById(skillId)?.name || skillId}。`);
    }
    this.save();
    this.showSkillLoadout();
  }

  private autoEquipSkills(questId = ''): void {
    const state = this.state();
    const quest = questById(questId) || undefined;
    state.equippedSkills = recommendedSkills(
      state,
      quest,
      skillSlots(state),
    ).map((skill) => skill.id);
    addLog(
      state,
      `自动装配：${state.equippedSkills
        .map((id) => skillById(id)?.name)
        .filter(Boolean)
        .join(' / ')}。`,
    );
    this.save();
    this.showSkillLoadout();
  }

  private showWeeklyGoalMenu(): void {
    const state = this.state();
    const goals = weeklyGoalChoices(state);
    const current = selectedWeeklyGoal(state);
    const body = [
      current
        ? `本周 OKR：${current.title} ${weeklyGoalProgress(state, current)}/${current.target}`
        : '本周 OKR：还没承诺。',
      '每周只能承诺一个方向。奖励更强，但没达成会少一个 Boss 准备项。',
      '',
      ...goals.map(
        (goal) =>
          `${goal.id === current?.id ? '当前' : '可选'} · ${goal.title}：${goal.description}`,
      ),
    ].join('\n');
    this.showDialog(
      '本周 OKR',
      body,
      [
        ...goals.map((goal) => ({
          label: goal.id === current?.id ? `${goal.title} ✓` : goal.title,
          onClick: () => this.chooseWeeklyGoal(goal.id),
        })),
        { label: '返回训练台', onClick: () => this.showTraining() },
      ],
      'training',
    );
  }

  private chooseWeeklyGoal(goalId: string): void {
    const state = this.state();
    if (!weeklyGoalChoices(state).some((goal) => goal.id === goalId)) return;
    state.weeklyGoalBaseline = weeklyBaseline(state);
    state.weeklyGoalStartedDay = state.day;
    state.weeklyGoalId = goalId;
    const goal = selectedWeeklyGoal(state);
    if (!goal) return;
    addLog(state, `本周 OKR：${goal.title}。${goal.description}`);
    this.save();
    this.showWeeklyGoalMenu();
  }

  private showRouteVowMenu(): void {
    const state = this.state();
    const routes = availableRouteVows(state);
    const body = [
      `经营专精 ${routeVows(state).length}/${routeVowSlots(state)}。Lv.2 开第一条，Lv.5 或二周目开第二条。`,
      '这不是称号，是打法。选了以后技能、结算和 Boss 审判都会变。',
      '',
      ...routes.map(
        (route) =>
          `${ROUTE_VOWS[route].title}：${PERK_LABELS[ROUTE_VOWS[route].id]}`,
      ),
    ].join('\n');
    this.showDialog(
      '经营专精',
      body,
      [
        ...routes.map((route) => ({
          label: ROUTE_VOWS[route].title,
          onClick: () => this.chooseRouteVow(route),
        })),
        { label: '返回训练台', onClick: () => this.showTraining() },
      ],
      'training',
    );
  }

  private chooseRouteVow(route: RouteKey): void {
    const state = this.state();
    const vow = ROUTE_VOWS[route];
    if (!availableRouteVows(state).includes(route)) return;
    state.perks.push(vow.id);
    state.routes[route] = clamp(state.routes[route] + 12, 0, 100);
    if (!state.storyFlags.includes(`vow-${route}`))
      state.storyFlags.push(`vow-${route}`);
    addLog(state, vow.line);
    addLog(state, `经营专精成型：${vow.title}。`);
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    this.save();
    this.drawWorld();
    this.showTraining();
  }

  private train(key: TrainingKey): void {
    const state = this.state();
    const cost = trainCost(state.level, state.training[key]);
    if (state.actionPoints <= 0 || state.stats.cash < cost) return;
    state.stats.cash -= cost;
    state.actionPoints -= 1;
    state.training[key] += 1;
    state.xp += 16;
    state.stats.energy = clamp(
      state.stats.energy + (key === 'recovery' ? 10 : 2),
      0,
      100,
    );
    state.stats.patience = clamp(
      state.stats.patience + (key === 'recovery' ? 10 : 2),
      0,
      100,
    );
    state.stats.boundary = clamp(
      state.stats.boundary + (key === 'sla' ? 6 : 1),
      0,
      100,
    );
    if (key === 'recovery' && state.issues.length) {
      const cleared = state.issues.shift();
      if (cleared) addLog(state, `复盘清理：${cleared.label} 被写进售后边界。`);
      if (state.perks.includes('review-cleanup')) {
        const extra = state.issues.shift();
        if (extra) addLog(state, `复盘清债：顺手又清掉 ${extra.label}。`);
      }
    }
    const perk = TRAINING_PERKS[key];
    if (state.training[key] >= perk.level && !state.perks.includes(perk.id)) {
      state.perks.push(perk.id);
      addLog(state, perk.line);
      if (
        perk.id === 'shadow-clone' &&
        !state.achievements.includes('shadow-online')
      ) {
        state.achievements.push('shadow-online');
        addLog(state, '成就：影流上线。');
      }
    }
    addLog(
      state,
      `${TRAINING[key].name} 升到 Lv.${state.training[key]}：${TRAINING[key].line}`,
    );
    levelUp(state).forEach((line) => addLog(state, line));
    syncProgression(state);
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    this.save();
    this.drawWorld();
    this.showTraining();
  }

  private showBoard(): void {
    const state = this.state();
    syncProgression(state);
    const open = QUESTS.filter(
      (quest) => quest.unlock(state) && !state.completed.includes(quest.id),
    );
    const questLines = open
      .map((quest) => {
        const locked =
          (state.locks[quest.id] || 0) > state.day
            ? ` · 冷却到 DAY ${state.locks[quest.id]}`
            : '';
        return `${quest.boss ? 'BOSS' : quest.advanced ? '现场' : '办公室'} · ${quest.title} · Lv.${quest.recommendedLevel}${locked}`;
      })
      .join('\n');
    const issues = state.issues.length
      ? state.issues
          .map((item) => `${item.label} +${item.severity}`)
          .join(' / ')
      : '暂无遗留问题';
    const route = routeLeader(state);
    const perks = state.perks.length
      ? state.perks.map((id) => PERK_LABELS[id].split('：')[0]).join(' / ')
      : '暂无';
    const weekly = selectedWeeklyGoal(state);
    const vows =
      routeVows(state)
        .map((route) => ROUTE_VOWS[route].title)
        .join(' / ') || '未定';
    const weeklyLine = weekly
      ? `${weekly.title} ${weeklyGoalProgress(state, weekly)}/${weekly.target}${state.claimedRewards.includes(weeklyRewardKey(state, weekly)) ? ' 已领奖' : ''}`
      : '未承诺';
    const longGoal = nextLongTermGoal(state);
    const longGoalLine = longGoal
      ? `${longGoal.title} ${longTermGoalProgress(state, longGoal)}/${longGoal.target}${longTermGoalComplete(state, longGoal) ? ' 可领奖' : ''}`
      : '长期目标全清，去打更高周目。';
    this.showDialog(
      '任务板',
      `${chapterTitle(state.chapter)}\n主线目标：${chapterObjective(state)}\n本周目标：${weeklyLine}\n长期经营：${longGoalLine}\n当前路线：${routeLabel(route)} ${state.routes[route]} / 专精：${vows} / 特质：${perks}\n下一里程碑：${nextRouteMilestoneLine(state)}\n\n今日可处理：\n${questLines || '没有新客户'}\n\n遗留问题：${issues}\n${bossDocketLine(state)}\n\n任务板只做情报，不直接接单。要接客户，回到地图靠近 NPC；要处理现场风险，靠近服务器墙、会议室、采购桌这些热点。案卷和存档在右上角菜单里。`,
      [{ label: '知道了', onClick: () => this.closeModal() }],
      'board',
    );
  }

  private showMenu(): void {
    this.showDialog(
      '菜单 / 存档',
      SAVE_OK,
      [
        { label: '售后案卷', onClick: () => this.showCodex() },
        { label: '复制迁移码', onClick: () => this.exportSave() },
        { label: '导入迁移码', onClick: () => this.importSave() },
        { label: '重开 v3', onClick: () => this.resetGame() },
        { label: '关闭', onClick: () => this.closeModal() },
      ],
      'menu',
    );
  }

  private showCodex(
    page: 'overview' | 'goals' | 'achievements' | 'stories' = this.codexPage,
  ): void {
    this.codexPage = page;
    const state = this.state();
    syncProgression(state);
    const route = routeLeader(state);
    const mobile = this.isPortrait();
    const weekly = selectedWeeklyGoal(state);
    const achievementLines = ACHIEVEMENTS.map((item) => {
      const done = state.achievements.includes(item.id);
      return `${done ? '已得' : '未得'} · ${item.title}：${done ? item.description : achievementHint(item.id)}`;
    })
      .slice(0, mobile ? 6 : ACHIEVEMENTS.length)
      .join('\n');
    const storyLines = STORY_CARDS.map((card) => {
      const unlocked = storyCardUnlocked(state, card.id);
      return `${unlocked ? '解锁' : '锁定'} · ${card.title}：${unlocked ? card.line : card.unlockHint}`;
    });
    const memoryLines = CASE_MEMORIES.map((memory) => {
      const unlocked = caseMemoryUnlocked(state, memory.id);
      return `${unlocked ? '解锁' : '锁定'} · ${memory.title}：${unlocked ? memory.line : memory.unlockHint}`;
    });
    const legacyLines = LEGACIES.map(
      (legacy) =>
        `${hasLegacy(state, legacy.route) ? '继承' : '未继承'} · ${legacy.title}：${hasLegacy(state, legacy.route) ? `${legacy.line} ${legacy.effectLine}` : '通关对应路线后继承。'}`,
    );
    const longGoalLines = LONG_TERM_GOALS.map(
      (goal) =>
        `${longTermGoalClaimed(state, goal.id) ? '完成' : longTermGoalComplete(state, goal) ? '可领' : '推进'} · ${goal.title}：${longTermGoalProgress(state, goal)}/${goal.target} · ${longTermGoalClaimed(state, goal.id) ? goal.storyLine : goal.description}`,
    );
    const docketLines = bossDocketCards(state).map(
      (card) => `备好 · ${card.title}：${card.line}`,
    );
    const storyTabLines = [
      ...storyLines,
      ...memoryLines,
      ...longGoalLines,
      ...docketLines,
      ...legacyLines,
    ]
      .slice(0, mobile ? 7 : 24)
      .join('\n');
    const nextGoal = nextLongTermGoal(state);
    const goalTabLines = [
      nextGoal
        ? `当前追踪：${nextGoal.title} ${longTermGoalProgress(state, nextGoal)}/${nextGoal.target}\n${nextGoal.description}\n${nextGoal.rewardLine}`
        : '长期目标已全清，继续推高周目难度。',
      '',
      '长期经营：',
      ...longGoalLines,
      '',
      `Boss 材料 ${bossDocketCards(state).length}/${BOSS_DOCKET_CARDS.length}：`,
      ...(docketLines.length
        ? docketLines
        : ['暂无。完成长期目标后会变成 Boss 战实际减压材料。']),
    ]
      .slice(0, mobile ? 10 : 30)
      .join('\n');
    const relationLines = QUESTS.filter((quest) => !quest.boss)
      .slice(0, mobile ? 3 : 6)
      .map((quest) => {
        const relation = state.relationships[quest.id] || 0;
        const label = relation > 14 ? '信任' : relation < -8 ? '旧账' : '普通';
        return `${quest.title} ${label}${relation ? signed(relation) : '+0'}`;
      })
      .join(' / ');
    const routeLines = (Object.keys(state.routes) as RouteKey[])
      .map((key) => `${routeLabel(key)} ${state.routes[key]}`)
      .join(' / ');
    const overview = [
      `周目 ${state.cycle} · ${chapterTitle(state.chapter)} · 当前主路线：${routeLabel(route)}`,
      `下个目标：${chapterObjective(state)}`,
      weekly
        ? `周目标：${weekly.title} ${weeklyGoalProgress(state, weekly)}/${weekly.target}${state.claimedRewards.includes(weeklyRewardKey(state, weekly)) ? ' 已领奖' : ''} · ${weekly.description}`
        : '周目标：未承诺。去训练台选择 OKR 后才有奖励/惩罚。',
      `经营专精：${
        routeVows(state)
          .map((item) => ROUTE_VOWS[item].title)
          .join(' / ') || '未定'
      }`,
      `路线进度：${routeLines}`,
      `下一里程碑：${nextRouteMilestoneLine(state)}`,
      `客户关系：${relationLines || '暂无'}`,
      `成就 ${state.achievements.length}/${ACHIEVEMENTS.length} · 剧情 ${unlockedStoryCount(state)}/${STORY_CARDS.length + CASE_MEMORIES.length + LONG_TERM_GOALS.length} · Boss材料 ${bossDocketCards(state).length}/${BOSS_DOCKET_CARDS.length} · 遗产 ${LEGACIES.filter((legacy) => hasLegacy(state, legacy.route)).length}/${LEGACIES.length}`,
      bossDocketLine(state),
    ];
    const body =
      page === 'achievements'
        ? [
            `成就墙 ${state.achievements.length}/${ACHIEVEMENTS.length}`,
            achievementLines,
          ].join('\n')
        : page === 'goals'
          ? goalTabLines
          : page === 'stories'
            ? [
                `剧情案卷 ${unlockedStoryCount(state)}/${STORY_CARDS.length + CASE_MEMORIES.length + LONG_TERM_GOALS.length} · Boss材料 ${bossDocketCards(state).length}/${BOSS_DOCKET_CARDS.length} · 周目遗产 ${LEGACIES.filter((legacy) => hasLegacy(state, legacy.route)).length}/${LEGACIES.length}`,
                storyTabLines,
              ].join('\n')
            : overview.slice(0, mobile ? 7 : overview.length).join('\n');
    this.showDialog(
      '售后案卷',
      body,
      [
        {
          label: page === 'overview' ? '概览 ✓' : '概览',
          onClick: () => this.showCodex('overview'),
        },
        {
          label: page === 'goals' ? '目标 ✓' : '目标',
          onClick: () => this.showCodex('goals'),
        },
        {
          label: page === 'achievements' ? '成就 ✓' : '成就',
          onClick: () => this.showCodex('achievements'),
        },
        {
          label: page === 'stories' ? '故事 ✓' : '故事',
          onClick: () => this.showCodex('stories'),
        },
        { label: '返回菜单', onClick: () => this.showMenu() },
        { label: '关闭', onClick: () => this.closeModal() },
      ],
      'menu',
    );
  }

  private exportSave(): void {
    const code = encodeSave(this.state());
    navigator.clipboard?.writeText(code).then(
      () => this.toast('迁移码已复制。'),
      () =>
        this.showDialog(
          '迁移码',
          code,
          [{ label: '关闭', onClick: () => this.closeModal() }],
          'menu',
        ),
    );
  }

  private importSave(): void {
    const code = window.prompt('粘贴 YBRPG3: 开头的存档迁移码');
    if (!code) return;
    try {
      this.shared.setState(decodeSave(code.trim()));
      this.save();
      this.drawWorld();
      this.toast('导入成功。');
    } catch {
      this.toast('导入失败，需要完整 v3 存档码。');
    }
  }

  private resetGame(): void {
    if (!window.confirm('确定重开 v3 吗？当前本地存档会被覆盖。')) return;
    this.shared.setState(defaultState());
    this.save();
    this.drawWorld();
  }

  private switchMap(): void {
    const state = this.state();
    if (state.mapId === 'office') {
      state.mapId = 'clientSite';
      state.player.clientSite = { x: 126, y: 316 };
      addLog(state, '博哥走进客户现场，验收会议室的空气开始计费。');
    } else {
      state.mapId = 'office';
      state.player.office = { x: 824, y: 316 };
      addLog(state, '博哥回到办公室，云售后还在排队。');
    }
    this.save();
    this.drawWorld();
  }

  private restToNextDay(): void {
    const state = this.state();
    const upkeep = dailyOperatingCost(state);
    const unpaid = Math.max(0, upkeep - state.stats.cash);
    const issueLine =
      unpaid > 0
        ? `现金缺口 ${money(unpaid)}，会新增「维护债滚动」遗留，压力约 +${Math.ceil(unpaid / 18)}。`
        : '现金够缴今晚维护，不会新增维护债。';
    this.showDialog(
      '收工复盘',
      [
        `今晚维护成本：${money(upkeep)}。`,
        `当前现金：${money(state.stats.cash)}。`,
        issueLine,
        `睡醒后行动恢复到 3 点，体力/耐心恢复，压力会自然回落。`,
      ].join('\n'),
      [
        { label: '确认收工', onClick: () => this.performRestToNextDay() },
        { label: '先不睡', onClick: () => this.closeModal() },
      ],
      'event',
    );
  }

  private performRestToNextDay(): void {
    this.closeModal();
    const state = this.state();
    const upkeep = dailyOperatingCost(state);
    const paid = Math.min(state.stats.cash, upkeep);
    state.stats.cash -= paid;
    const unpaid = upkeep - paid;
    if (unpaid > 0) {
      state.stats.pressure = clamp(
        state.stats.pressure + Math.ceil(unpaid / 18),
        0,
        100,
      );
      state.issues.unshift({
        id: `maintenance-${Date.now()}`,
        label: '维护债滚动',
        type: 'pressure',
        severity: clamp(6 + Math.ceil(unpaid / 40), 6, 18),
        sourceQuest: 'maintenance',
      });
      state.issues = state.issues.slice(0, 6);
      addLog(
        state,
        `经营维护债：今天固定成本 ${money(upkeep)} 没缴齐，${money(unpaid)} 变成压力。`,
      );
    } else if (upkeep > 0) {
      addLog(
        state,
        `经营成本：支付办公室、云资源和客户维护 ${money(upkeep)}。`,
      );
    }
    const event = pickDailyEvent(state);
    state.day += 1;
    state.actionPoints = 3;
    state.stats.energy = clamp(
      state.stats.energy + 26 + state.training.recovery * 4,
      0,
      100,
    );
    state.stats.patience = clamp(
      state.stats.patience + 24 + state.training.recovery * 4,
      0,
      100,
    );
    state.stats.pressure = clamp(
      state.stats.pressure - 10 - state.training.recovery * 2,
      0,
      100,
    );
    applyStatEffect(state, event);
    if (
      state.training.recovery > 0 &&
      state.issues.length &&
      state.day % 2 === 0
    ) {
      const cleared = state.issues.shift();
      if (cleared) addLog(state, `复盘清理：${cleared.label} 的影响降低了。`);
    }
    addLog(state, `DAY ${state.day}：${event.title}。${event.line}`);
    syncProgression(state);
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    this.save();
    this.drawWorld();
    const choices =
      event.choices?.map((choice) => ({
        label: choice.label,
        onClick: () => {
          applyStatEffect(state, { effect: choice.effect });
          if (choice.training) {
            state.xp += 8;
            state.routes[trainingRoute(choice.training)] = clamp(
              state.routes[trainingRoute(choice.training)] + 3,
              0,
              100,
            );
            addLog(
              state,
              `${TRAINING[choice.training].name} 灵感 +1：下次去训练台更知道咋练。`,
            );
          }
          if (choice.clearIssue) {
            const cleared = state.issues.shift();
            if (cleared)
              addLog(state, `事件清理：${cleared.label} 没带到明天。`);
          }
          addLog(state, `DAY ${state.day} 抉择：${choice.line}`);
          syncProgression(state);
          claimProgressionRewards(state).forEach((line) => addLog(state, line));
          this.save();
          this.closeModal();
          this.drawWorld();
        },
      })) || [];
    this.showDialog(
      '新的一天',
      `${event.title}\n${event.line}\n\n行动恢复到 3 点，体力和耐心回升。\n选一个今天的处理姿势：`,
      [...choices, { label: '直接开门接单', onClick: () => this.closeModal() }],
      'event',
    );
  }

  private showDialog(
    title: string,
    body: string,
    options: Array<{ label: string; disabled?: boolean; onClick: () => void }>,
    kind: 'quest' | 'boss' | 'training' | 'board' | 'menu' | 'event' = 'quest',
  ): void {
    this.closeModal();
    this.modalDefaultAction = options.find(
      (option) => !option.disabled,
    )?.onClick;
    document.querySelector('.yrpg-touch-bridge')?.setAttribute('hidden', '');
    const vw = this.viewW();
    const vh = this.viewH();
    const mobile = this.isPortrait();
    const panelColor =
      kind === 'boss' ? 0x2a1420 : kind === 'training' ? 0x173a34 : 0x16292d;
    const richPanel =
      kind === 'menu' || kind === 'board' || kind === 'training';
    const panelW = mobile ? vw - 20 : GAME_W - 64;
    const panelH = mobile
      ? Math.min(richPanel ? 520 : 330, vh - 174)
      : richPanel
        ? 354
        : 184;
    const panelY = mobile
      ? vh - panelH / 2 - 42
      : richPanel
        ? GAME_H - panelH / 2 - 20
        : GAME_H - 112;
    const left = mobile ? 18 : 62;
    const top = panelY - panelH / 2;
    this.modal = this.add.container(0, 0).setDepth(200).setScrollFactor(0);
    const shade = this.add.rectangle(vw / 2, vh / 2, vw, vh, 0x000000, 0.34);
    const box = this.add
      .rectangle(vw / 2, panelY, panelW, panelH, panelColor, 0.97)
      .setStrokeStyle(3, 0xffdf86);
    const header = this.add
      .text(
        left,
        top + 16,
        title,
        pixelText(mobile ? 18 : 22, '#ffe6a8', '900'),
      )
      .setWordWrapWidth(panelW - 30);
    const compactMobileOptions = mobile && options.length > 4;
    const maxMobileBodyLines =
      kind === 'quest' || kind === 'boss' ? 7 : compactMobileOptions ? 10 : 12;
    const bodyLines = mobile
      ? body.split('\n').slice(0, maxMobileBodyLines)
      : body.split('\n');
    const truncated = mobile && body.split('\n').length > maxMobileBodyLines;
    const copyText = mobile
      ? `${bodyLines.map((line) => wrapCjkText(line, compactMobileOptions ? 25 : 30, kind === 'quest' || kind === 'boss' ? 2 : compactMobileOptions ? 2 : 3)).join('\n')}${truncated ? '\n……' : ''}`
      : body;
    const copy = this.add
      .text(
        left,
        top + (mobile ? 56 : richPanel ? 58 : 64),
        copyText,
        pixelText(mobile ? 12 : 13, '#f7ecd0', '700'),
      )
      .setWordWrapWidth(mobile ? panelW - 32 : richPanel ? 640 : 610)
      .setLineSpacing(4);
    this.modal.add([shade, box, header, copy]);
    options.forEach((option, index) => {
      const boardHeaderAction =
        mobile && kind === 'board' && options.length === 1;
      const columns = compactMobileOptions ? 2 : 1;
      const row = compactMobileOptions ? Math.floor(index / 2) : index;
      const col = compactMobileOptions ? index % 2 : 0;
      const mobileButtonH = compactMobileOptions ? 34 : 42;
      const mobileGap = compactMobileOptions ? 7 : 0;
      const mobileRows = Math.ceil(options.length / columns);
      const bx = boardHeaderAction
        ? vw - 116
        : mobile
          ? left + col * ((panelW - 36 + mobileGap) / columns)
          : 708;
      const by = boardHeaderAction
        ? top + 14
        : mobile
          ? top + panelH - 42 - (mobileRows - 1 - row) * (mobileButtonH + 6)
          : richPanel
            ? top + 58 + index * 32
            : GAME_H - 176 + index * 38;
      const bw = boardHeaderAction
        ? 98
        : mobile
          ? (panelW - 36 - mobileGap) / columns
          : 196;
      const buttonH = boardHeaderAction
        ? 34
        : mobile
          ? mobileButtonH
          : richPanel
            ? 29
            : 31;
      const button = this.makeButton(
        bx,
        by,
        bw,
        buttonH,
        option.label,
        option.onClick,
        option.disabled ? 0x4c4c4c : 0x285d72,
        mobile ? 11 : 12,
        option.disabled,
      );
      this.modal?.add(button);
      if (!option.disabled) {
        let hitFiring = false;
        const hit = this.add
          .rectangle(
            bx + bw / 2,
            by + buttonH / 2,
            bw,
            buttonH,
            0xffffff,
            0.001,
          )
          .setDepth(260)
          .setScrollFactor(0)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            if (hitFiring) return;
            hitFiring = true;
            option.onClick();
            this.time.delayedCall(140, () => {
              hitFiring = false;
            });
          });
        this.modalHitZones.push(hit);
      }
    });
  }

  private closeModal(): void {
    this.modalHitZones.forEach((hit) => hit.destroy());
    this.modalHitZones = [];
    this.modal?.destroy(true);
    this.modal = undefined;
    this.modalDefaultAction = undefined;
    if (this.scene.isActive('WorldScene'))
      document.querySelector('.yrpg-touch-bridge')?.removeAttribute('hidden');
  }

  private confirmModal(): void {
    if (this.modal && this.modalDefaultAction) {
      this.modalDefaultAction();
      return;
    }
    if (!this.modal) this.interact();
  }

  private toast(line: string): void {
    const toast = this.add
      .text(
        this.viewW() / 2,
        MAP_TOP + 30,
        line,
        pixelText(14, '#fff5d6', '900', '#173434'),
      )
      .setOrigin(0.5)
      .setDepth(260)
      .setScrollFactor(0);
    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: MAP_TOP + 10,
      delay: 900,
      duration: 360,
      onComplete: () => toast.destroy(),
    });
  }

  private makeButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    color = 0x264f5c,
    size = 12,
    disabled = false,
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const rect = this.add
      .rectangle(0, 0, w, h, color, disabled ? 0.45 : 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffdf86, disabled ? 0.2 : 0.65);
    const text = this.add
      .text(
        w / 2,
        h / 2,
        label,
        pixelText(size, disabled ? '#b9b9b9' : '#fff8dc', '900'),
      )
      .setOrigin(0.5);
    c.add([rect, text]);
    if (!disabled) {
      let firing = false;
      const fire = () => {
        if (firing) return;
        firing = true;
        this.tweens.add({
          targets: c,
          scaleX: 0.97,
          scaleY: 0.97,
          yoyo: true,
          duration: 70,
        });
        onClick();
        this.time.delayedCall(140, () => {
          firing = false;
        });
      };
      c.setSize(w, h).setInteractive(
        new Phaser.Geom.Rectangle(0, 0, w, h),
        Phaser.Geom.Rectangle.Contains,
      );
      c.on('pointerdown', fire);
      rect.setInteractive({ useHandCursor: true }).on('pointerdown', fire);
      text.setInteractive({ useHandCursor: true }).on('pointerdown', fire);
    }
    return c;
  }

  private statusLine(compact = false): string {
    const s = this.state().stats;
    const issues = this.state().issues.length
      ? `遗留 ${this.state().issues.length}`
      : '无遗留';
    if (compact)
      return `口碑${s.reputation} 体${s.energy} 耐${s.patience} 边${s.boundary} 压${s.pressure} ${issues}`;
    return `口碑 ${s.reputation} / 体力 ${s.energy} / 耐心 ${s.patience} / 边界 ${s.boundary} / 压力 ${s.pressure} / ${issues}`;
  }
}

class NegotiationScene extends Phaser.Scene {
  private battle?: BattleState;
  private quest?: QuestDefinition;
  private modalLocked = false;
  private skillPage = 0;

  constructor(private readonly shared: Shared) {
    super('NegotiationScene');
  }

  init(data: { questId: string }): void {
    this.skillPage = 0;
    this.quest = questById(data.questId) || undefined;
    if (!this.quest) return;
    const state = this.state();
    const issueHeat = state.issues.reduce(
      (sum, issue) => sum + issue.severity,
      0,
    );
    const failedBoost = state.failed.includes(this.quest.id) ? 8 : 0;
    const cycleBoost = Math.max(0, state.cycle - 1) * 5;
    const bossBoost = this.quest.boss
      ? Math.floor(issueHeat * 0.48)
      : Math.floor(issueHeat * 0.18);
    const weekly = selectedWeeklyGoal(state);
    const okrPenalty =
      this.quest.boss && weekly && !weeklyGoalComplete(state, weekly) ? 8 : 0;
    const relationship = state.relationships[this.quest.id] || 0;
    const relationTrust =
      relationship > 0
        ? Math.floor(relationship / 3)
        : Math.floor(relationship / 2);
    const relationAnger =
      relationship < 0
        ? Math.abs(Math.floor(relationship / 2))
        : -Math.floor(relationship / 5);
    const variant = activeCaseVariant(state, this.quest);
    const stance = selectedStance(state);
    applyStatEffect(state, { effect: stance.selfEffect });
    this.battle = {
      questId: this.quest.id,
      variantId: variant?.id,
      stanceId: stance.id,
      round: 1,
      client: {
        anger: clamp(
          this.quest.enemy.anger +
            failedBoost +
            bossBoost +
            cycleBoost +
            okrPenalty +
            relationAnger +
            (variant?.effect.anger || 0) +
            (stance.clientEffect.anger || 0),
          0,
          96,
        ),
        budget: clamp(
          this.quest.enemy.budget -
            Math.floor(bossBoost / 2) -
            cycleBoost -
            Math.floor(okrPenalty / 2) +
            Math.floor(Math.max(0, relationship) / 6) +
            (variant?.effect.budget || 0) +
            (stance.clientEffect.budget || 0),
          8,
          100,
        ),
        scope: clamp(
          this.quest.enemy.scope +
            failedBoost +
            bossBoost +
            cycleBoost +
            okrPenalty +
            (variant?.effect.scope || 0) +
            (stance.clientEffect.scope || 0),
          0,
          96,
        ),
        trust: clamp(
          this.quest.enemy.trust -
            failedBoost +
            relationTrust -
            Math.floor(okrPenalty / 2) +
            (variant?.effect.trust || 0) +
            (stance.clientEffect.trust || 0),
          0,
          100,
        ),
      },
      cooldowns: {},
      flags: [],
      log: [
        `${this.quest.client} 入场：${this.quest.intro}`,
        `策略开局：${stance.title}。${stance.line}`,
        variant ? `今日变体：${variant.introLine}` : '',
        okrPenalty && weekly
          ? `验收准备不足：本周 OKR「${weekly.title}」没完成，姐团开局更冲。`
          : '',
        questMemoryLine(state, this.quest) || this.quest.phaseLines?.[0] || '',
      ].filter(Boolean),
    };
    if (this.quest.boss) {
      const cards = bossDocketCards(state);
      cards.forEach((card) => {
        Object.entries(card.effect).forEach(([key, amount]) => {
          const stat = key as keyof ClientStats;
          this.battle!.client[stat] = clamp(
            this.battle!.client[stat] + (amount || 0),
            0,
            100,
          );
        });
        if (card.self) applyStatEffect(state, { effect: card.self });
      });
      if (cards.length) {
        const names = cards
          .slice(0, 5)
          .map((card) => card.title.replace('Boss 材料：', ''))
          .join(' / ');
        this.battle.log.unshift(
          `验收材料已备 ${cards.length} 份：${names}${cards.length > 5 ? ' / ...' : ''}。`,
        );
      }
    }
  }

  create(): void {
    document.querySelector('.yrpg-touch-bridge')?.setAttribute('hidden', '');
    this.draw();
  }

  private state(): SaveState {
    return this.shared.getState();
  }

  private save(): void {
    this.shared.save();
  }

  private draw(): void {
    this.children.removeAll();
    if (!this.quest || !this.battle) {
      this.scene.start('WorldScene');
      return;
    }
    if (this.isPortrait()) {
      this.drawMobile();
      return;
    }
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x111d24);
    this.add
      .rectangle(GAME_W / 2, 33, GAME_W, 66, 0x0c171b)
      .setStrokeStyle(1, 0x375b66);
    this.add.text(22, 14, this.quest.title, pixelText(23, '#ffe6a8', '900'));
    this.add.text(
      22,
      42,
      `ROUND ${this.battle.round}/6 · ${this.quest.client}`,
      pixelText(12, '#d8f6ed', '900'),
    );
    this.add.text(
      758,
      18,
      `现金风险 ${money(Math.max(0, 100 - this.battle.client.budget))}`,
      pixelText(13, '#f8d76a', '900'),
    );

    this.drawPortraits();
    this.drawStats();
    this.drawLog();
    this.drawSkills();
  }

  private viewW(): number {
    return this.scale.width;
  }

  private viewH(): number {
    return this.scale.height;
  }

  private isPortrait(): boolean {
    return this.viewW() < 720 && this.viewH() > this.viewW();
  }

  private drawMobile(): void {
    if (!this.quest || !this.battle) return;
    const vw = this.viewW();
    const vh = this.viewH();
    const compact = vh < 760;
    this.add.rectangle(vw / 2, vh / 2, vw, vh, 0x101f22);
    this.add
      .rectangle(vw / 2, 40, vw, 80, 0x0c171b)
      .setStrokeStyle(1, 0x375b66);
    this.add
      .text(50, 8, this.quest.title, pixelText(18, '#ffe6a8', '900'))
      .setWordWrapWidth(vw - 62);
    this.add
      .text(
        12,
        36,
        `ROUND ${this.battle.round}/6 · ${this.quest.client}`,
        pixelText(11, '#d8f6ed', '900'),
      )
      .setWordWrapWidth(vw - 24);
    this.add.text(
      12,
      58,
      `现金风险 ${money(Math.max(0, 100 - this.battle.client.budget))}`,
      pixelText(11, '#f8d76a', '900'),
    );

    this.drawMobilePortraits(compact ? 84 : 92);
    this.drawMobileStats(compact ? 190 : 216);
    const logY = compact ? 328 : 372;
    const logH = compact ? 92 : 112;
    this.drawMobileLog(logY, logH);
    const skillY = compact
      ? Math.min(vh - 144, logY + logH + 12)
      : Math.min(526, Math.max(490, vh - 154));
    if (!compact) {
      this.add
        .text(
          14,
          skillY - 36,
          '目标：信任>=70 且预算>=50；撑到 6 回合可部分成功。怒气/蔓延爆表会失败。',
          pixelText(10, '#c8ddd8', '700'),
        )
        .setWordWrapWidth(vw - 28);
    }
    this.drawMobileSkills(skillY);
  }

  private drawMobilePortraits(y: number): void {
    if (!this.quest) return;
    const vw = this.viewW();
    const shadowReady = this.state().training.shadow > 0;
    const cardW = (vw - 36) / 2;
    this.add
      .rectangle(14, y, cardW, 110, 0x173434, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x4aa88d);
    this.add.text(24, y + 10, '博哥', pixelText(15, '#ffe6a8', '900'));
    addBoPhoto(this, 24, y + 34, 74, 62, shadowReady ? 'shadow' : 'talk');
    this.add
      .text(
        110,
        y + 50,
        shadowReady ? '影流待命' : '稳住边界',
        pixelText(10, '#d8f6ed', '700'),
      )
      .setWordWrapWidth(cardW - 118);

    const rightX = 22 + cardW;
    this.add
      .rectangle(
        rightX,
        y,
        cardW,
        110,
        this.quest.boss ? 0x301824 : 0x26314e,
        0.95,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(1, this.quest.boss ? 0xf0849b : 0x7da8ff);
    this.add.text(
      rightX + 10,
      y + 10,
      this.quest.boss ? '验收组' : '客户',
      pixelText(15, '#ffe6a8', '900'),
    );
    this.add
      .sprite(rightX + 58, y + 72, this.quest.boss ? 'bossNpc' : 'npc-2')
      .setScale(1.25)
      .setTint(npcTint(this.quest.npcId));
    this.add
      .text(
        rightX + 96,
        y + 38,
        wrapCjkText(this.clientIntent(), 8, 4),
        pixelText(10, '#d8f6ed', '700'),
      )
      .setWordWrapWidth(cardW - 106);
  }

  private drawMobileStats(y: number): void {
    if (!this.battle) return;
    const state = this.state();
    const colW = (this.viewW() - 36) / 2;
    const leftStats: Array<[string, number, number]> = [
      ['体力', state.stats.energy, 0x56d79d],
      ['耐心', state.stats.patience, 0xf8d76a],
      ['边界', state.stats.boundary, 0x7da8ff],
      ['压力', state.stats.pressure, 0xff8b72],
    ];
    const clientStats: Array<[string, number, number]> = [
      ['怒气', this.battle.client.anger, 0xff8b72],
      ['预算', this.battle.client.budget, 0xf8d76a],
      ['蔓延', this.battle.client.scope, 0xd498ff],
      ['信任', this.battle.client.trust, 0x56d79d],
    ];
    this.add.text(14, y, '博哥资源', pixelText(12, '#ffe6a8', '900'));
    this.add.text(22 + colW, y, '客户状态', pixelText(12, '#ffe6a8', '900'));
    leftStats.forEach((item, index) =>
      this.drawCompactBar(
        14,
        y + 24 + index * 30,
        colW,
        item[0],
        item[1],
        item[2],
      ),
    );
    clientStats.forEach((item, index) =>
      this.drawCompactBar(
        22 + colW,
        y + 24 + index * 30,
        colW,
        item[0],
        item[1],
        item[2],
      ),
    );
  }

  private drawCompactBar(
    x: number,
    y: number,
    w: number,
    label: string,
    value: number,
    color: number,
  ): void {
    this.add.text(
      x,
      y,
      `${label} ${Math.round(value)}`,
      pixelText(10, '#f7ecd0', '900'),
    );
    this.add
      .rectangle(x, y + 20, w, 8, 0x0a1215)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x4a6265);
    this.add
      .rectangle(x, y + 20, (w * clamp(value, 0, 100)) / 100, 8, color)
      .setOrigin(0, 0.5);
  }

  private drawMobileLog(y: number, h = 112): void {
    if (!this.battle) return;
    const w = this.viewW() - 28;
    this.add
      .rectangle(14, y, w, h, 0x0b1519, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x3f6064);
    this.add.text(24, y + 10, '战斗日志', pixelText(12, '#ffe6a8', '900'));
    const visible = h < 100 ? 2 : 3;
    this.battle.log.slice(0, visible).forEach((line, index) => {
      this.add
        .text(
          24,
          y + 32 + index * 24,
          wrapCjkText(line, 28, h < 100 ? 1 : 2),
          pixelText(10, index === 0 ? '#ffe6a8' : '#d8f6ed', '700'),
        )
        .setWordWrapWidth(w - 20);
    });
  }

  private drawMobileSkills(y: number): void {
    const state = this.state();
    const available = sortedBattleSkills(state, this.quest);
    const pageSize = 4;
    const maxPage = Math.max(0, Math.ceil(available.length / pageSize) - 1);
    this.skillPage = clamp(this.skillPage, 0, maxPage);
    const page = available.slice(
      this.skillPage * pageSize,
      this.skillPage * pageSize + pageSize,
    );
    const gap = 8;
    const x0 = 14;
    const bw = Math.floor((this.viewW() - x0 * 2 - gap) / 2);
    page.forEach((skill, index) => {
      const x = x0 + (index % 2) * (bw + gap);
      const by = y + Math.floor(index / 2) * 48;
      const disabled = this.skillDisabled(skill);
      const label = `${skill.name}\n${skillEffectSummary(skill)} · 体${skill.energy} 耐${skill.patience}${this.battle?.cooldowns[skill.id] ? ` CD${this.battle.cooldowns[skill.id]}` : ''}`;
      const button = makeSceneButton(
        this,
        x,
        by,
        bw,
        40,
        label,
        () => this.useSkill(skill),
        disabled ? 0x3e4145 : routeColor(skill.category),
        disabled,
        10,
      );
      this.add.existing(button);
    });
    if (maxPage > 0) {
      const pagerY = y + 100;
      const prev = makeSceneButton(
        this,
        x0,
        pagerY,
        bw,
        34,
        '上一组',
        () => {
          this.skillPage = Math.max(0, this.skillPage - 1);
          this.draw();
        },
        0x294e58,
        this.skillPage <= 0,
        10,
      );
      const next = makeSceneButton(
        this,
        x0 + bw + gap,
        pagerY,
        bw,
        34,
        `下一组 ${this.skillPage + 1}/${maxPage + 1}`,
        () => {
          this.skillPage = Math.min(maxPage, this.skillPage + 1);
          this.draw();
        },
        0x294e58,
        this.skillPage >= maxPage,
        10,
      );
      this.add.existing(prev);
      this.add.existing(next);
    }
  }

  private drawPortraits(): void {
    const shadowReady = this.state().training.shadow > 0;
    this.add
      .rectangle(52, 88, 218, 252, 0x173434, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4aa88d);
    addBoPhoto(this, 86, 130, 152, 154, shadowReady ? 'shadow' : 'talk');
    this.add.text(72, 96, '博哥', pixelText(18, '#ffe6a8', '900'));
    this.add
      .text(
        72,
        320,
        shadowReady ? 'ShadowBo 可响应影流技能' : '稳住怒气，别让需求扩容',
        pixelText(12, '#d8f6ed', '700'),
      )
      .setWordWrapWidth(180);

    this.add
      .rectangle(
        690,
        88,
        218,
        252,
        this.quest?.boss ? 0x301824 : 0x26314e,
        0.95,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(2, this.quest?.boss ? 0xf0849b : 0x7da8ff);
    this.add
      .sprite(800, 206, this.quest?.boss ? 'bossNpc' : 'npc-2')
      .setScale(2.35)
      .setTint(npcTint(this.quest?.npcId || ''));
    this.add
      .text(
        708,
        96,
        this.quest?.client || '客户',
        pixelText(17, '#ffe6a8', '900'),
      )
      .setWordWrapWidth(166);
    this.add
      .text(708, 318, this.clientIntent(), pixelText(12, '#d8f6ed', '700'))
      .setWordWrapWidth(166);
  }

  private drawStats(): void {
    if (!this.battle) return;
    const state = this.state();
    const leftStats: Array<[string, number, number]> = [
      ['体力', state.stats.energy, 0x56d79d],
      ['耐心', state.stats.patience, 0xf8d76a],
      ['边界', state.stats.boundary, 0x7da8ff],
      ['压力', state.stats.pressure, 0xff8b72],
    ];
    const clientStats: Array<[string, number, number]> = [
      ['怒气', this.battle.client.anger, 0xff8b72],
      ['预算', this.battle.client.budget, 0xf8d76a],
      ['蔓延', this.battle.client.scope, 0xd498ff],
      ['信任', this.battle.client.trust, 0x56d79d],
    ];
    leftStats.forEach((item, index) =>
      this.drawBar(306, 92 + index * 29, item[0], item[1], item[2]),
    );
    clientStats.forEach((item, index) =>
      this.drawBar(306, 220 + index * 29, item[0], item[1], item[2]),
    );
  }

  private drawBar(
    x: number,
    y: number,
    label: string,
    value: number,
    color: number,
  ): void {
    this.add.text(x, y, label, pixelText(12, '#f7ecd0', '900'));
    this.add
      .rectangle(x + 66, y + 8, 220, 12, 0x0a1215)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x4a6265);
    this.add
      .rectangle(x + 66, y + 8, (220 * clamp(value, 0, 100)) / 100, 12, color)
      .setOrigin(0, 0.5);
    this.add.text(
      x + 300,
      y,
      String(Math.round(value)),
      pixelText(12, '#fff8dc', '900'),
    );
  }

  private drawLog(): void {
    if (!this.battle) return;
    this.add
      .rectangle(480, 374, 382, 74, 0x0b1519, 0.92)
      .setStrokeStyle(1, 0x3f6064);
    this.battle.log.slice(0, 3).forEach((line, index) => {
      this.add
        .text(
          306,
          346 + index * 20,
          wrapCjkText(line, 34, 1),
          pixelText(10, index === 0 ? '#ffe6a8' : '#d8f6ed', '700'),
        )
        .setWordWrapWidth(346);
    });
  }

  private drawSkills(): void {
    const state = this.state();
    const available = sortedBattleSkills(state, this.quest);
    const pageSize = 8;
    const maxPage = Math.max(0, Math.ceil(available.length / pageSize) - 1);
    this.skillPage = clamp(this.skillPage, 0, maxPage);
    const page = available.slice(
      this.skillPage * pageSize,
      this.skillPage * pageSize + pageSize,
    );
    page.forEach((skill, index) => {
      const x = 42 + (index % 4) * 222;
      const y = 434 + Math.floor(index / 4) * 48;
      const disabled = this.skillDisabled(skill);
      const label = `${skill.name}\n${skillEffectSummary(skill)} · 体${skill.energy} 耐${skill.patience}${this.battle?.cooldowns[skill.id] ? ` CD${this.battle.cooldowns[skill.id]}` : ''}`;
      const button = makeSceneButton(
        this,
        x,
        y,
        202,
        40,
        label,
        () => this.useSkill(skill),
        disabled ? 0x3e4145 : routeColor(skill.category),
        disabled,
        10,
      );
      this.add.existing(button);
    });
    this.add.text(
      40,
      416,
      `目标：信任>=70 且预算>=50；怒气/蔓延爆表会失败。技能组 ${this.skillPage + 1}/${maxPage + 1}`,
      pixelText(10, '#c8ddd8', '700'),
    );
    if (maxPage > 0) {
      const prev = makeSceneButton(
        this,
        780,
        386,
        66,
        24,
        '上组',
        () => {
          this.skillPage = Math.max(0, this.skillPage - 1);
          this.draw();
        },
        0x294e58,
        this.skillPage <= 0,
        9,
      );
      const next = makeSceneButton(
        this,
        852,
        386,
        66,
        24,
        '下组',
        () => {
          this.skillPage = Math.min(maxPage, this.skillPage + 1);
          this.draw();
        },
        0x294e58,
        this.skillPage >= maxPage,
        9,
      );
      this.add.existing(prev);
      this.add.existing(next);
    }
  }

  private useSkill(skill: SkillDefinition): void {
    if (
      !this.quest ||
      !this.battle ||
      this.modalLocked ||
      this.skillDisabled(skill)
    )
      return;
    const state = this.state();
    state.stats.energy = clamp(state.stats.energy - skill.energy, 0, 100);
    state.stats.patience = clamp(state.stats.patience - skill.patience, 0, 100);
    if (skill.boundary)
      state.stats.boundary = clamp(
        state.stats.boundary - skill.boundary,
        0,
        100,
      );
    const trainingBonus = skill.training ? state.training[skill.training] : 0;
    Object.entries(skill.effect).forEach(([key, amount]) => {
      const stat = key as keyof ClientStats;
      const direction = amount && amount > 0 ? 1 : -1;
      const preferredBonus =
        skill.training && this.quest?.preferred?.includes(skill.training)
          ? 3
          : 0;
      const perkBonus = skillPerkBonus(state, skill, stat);
      const resistance = this.quest?.resistance?.[stat] || 0;
      this.battle!.client[stat] = clamp(
        this.battle!.client[stat] +
          (amount || 0) +
          direction *
            (trainingBonus * 3 + preferredBonus + perkBonus - resistance),
        0,
        100,
      );
    });
    const selfEffect = { ...(skill.self || {}) };
    if (skill.id === 'split' && state.perks.includes('shadow-clone'))
      selfEffect.pressure = (selfEffect.pressure || 0) - 8;
    if (Object.keys(selfEffect).length)
      applyStatEffect(state, {
        id: 'skill',
        title: skill.name,
        line: skill.line,
        effect: selfEffect,
      });
    state.routes[skill.category] = clamp(
      state.routes[skill.category] + 4 + trainingBonus,
      0,
      100,
    );
    this.battle.cooldowns[skill.id] = skill.cooldown + 1;
    this.battle.log.unshift(`博哥：${skill.line}`);
    this.flashLine(skill.category);

    const early = this.evaluate();
    if (early) {
      this.finish(early);
      return;
    }

    this.clientTurn();
    Object.keys(this.battle.cooldowns).forEach((id) => {
      this.battle!.cooldowns[id] = Math.max(0, this.battle!.cooldowns[id] - 1);
    });
    this.battle.round += 1;
    const outcome = this.evaluate();
    if (outcome) {
      this.finish(outcome);
      return;
    }
    this.save();
    this.draw();
  }

  private flashLine(route: RouteKey): void {
    const color = routeColor(route);
    const w = this.viewW();
    const h = this.viewH();
    const flash = this.add
      .rectangle(w / 2, h / 2, w, h, color, 0.12)
      .setDepth(180)
      .setScrollFactor(0);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 220,
      onComplete: () => flash.destroy(),
    });
  }

  private skillDisabled(skill: SkillDefinition): boolean {
    const state = this.state();
    if (!this.battle) return true;
    if (!skillUnlocked(state, skill)) return true;
    if ((this.battle.cooldowns[skill.id] || 0) > 0) return true;
    if (
      state.stats.energy < skill.energy ||
      state.stats.patience < skill.patience
    )
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

  private clientTurn(): void {
    if (!this.battle || !this.quest) return;
    const state = this.state();
    const client = this.battle.client;
    const highest = Object.entries({
      anger: client.anger,
      budget: 100 - client.budget,
      scope: client.scope,
      trust: 100 - client.trust,
    }).sort((a, b) => b[1] - a[1])[0][0];
    const issueBonus = Math.min(
      9,
      state.issues.reduce((sum, issue) => sum + issue.severity, 0) / 6,
    );
    const actions: Record<
      string,
      {
        line: string;
        effect: Partial<ClientStats>;
        self?: Partial<SaveState['stats']>;
      }
    > = {
      anger: {
        line: '客户提高音量：这事今天必须给说法。',
        effect: { anger: 10 + issueBonus, trust: -6 },
        self: { patience: -7 },
      },
      budget: {
        line: '采购开始砍价：你们云是不是还能再便宜点。',
        effect: { budget: -12 - issueBonus, anger: 5 },
        self: { energy: -5 },
      },
      scope: {
        line: '需求开始蔓延：顺手把日报、告警、权限也做了吧。',
        effect: { scope: 13 + issueBonus, trust: -4 },
        self: { patience: -5 },
      },
      trust: {
        line: '客户追问案例：有没有同规模落地截图。',
        effect: { trust: -9, scope: 6 },
        self: { energy: -5, pressure: 4 },
      },
    };
    const action = actions[highest];
    const stanceId = this.battle.stanceId || state.contractStanceId;
    const actionEffect = { ...action.effect };
    let actionLine = action.line;
    if (stanceId === 'prepaid' && highest === 'budget') {
      actionEffect.budget = Math.ceil((actionEffect.budget || 0) * 0.55);
      actionLine = '预收款节点挡了一刀：采购还能砍，但不能从零开始砍。';
    }
    if (stanceId === 'milestone' && highest === 'scope') {
      actionEffect.scope = Math.ceil((actionEffect.scope || 0) * 0.52);
      actionLine = '里程碑拆单生效：新增需求被拆到下一阶段，不再一口吞。';
    }
    if (stanceId === 'hard-boundary' && highest === 'scope') {
      actionEffect.scope = Math.min(actionEffect.scope || 0, 6);
      actionEffect.anger = (actionEffect.anger || 0) + 4;
      actionLine = '合同边界顶住了蔓延：客户有点上火，但范围没继续膨胀。';
    }
    if (
      stanceId === 'shadow-alt' &&
      this.battle.round === 3 &&
      !this.battle.flags.includes('shadow-branch')
    ) {
      this.battle.flags.push('shadow-branch');
      client.trust = clamp(client.trust + 12, 0, 100);
      client.scope = clamp(client.scope - 10, 0, 100);
      actionLine =
        '影流三选一开桌：稳态版、快速版、旗舰版摆出来，客户先选路再追问。';
    }
    Object.entries(actionEffect).forEach(([key, amount]) => {
      const stat = key as keyof ClientStats;
      this.battle!.client[stat] = clamp(
        this.battle!.client[stat] + (amount || 0),
        0,
        100,
      );
    });
    if (action.self)
      applyStatEffect(state, {
        id: 'client',
        title: 'client',
        line: actionLine,
        effect: action.self,
      });
    const phase =
      this.quest.phaseLines?.[
        (this.battle.round - 1) % this.quest.phaseLines.length
      ];
    const issue =
      this.quest.boss && state.issues.length
        ? state.issues[(this.battle.round - 1) % state.issues.length]
        : undefined;
    if (issue) {
      const trial = bossIssueTrial(issue);
      Object.entries(trial.effect).forEach(([key, amount]) => {
        const stat = key as keyof ClientStats;
        this.battle!.client[stat] = clamp(
          this.battle!.client[stat] + (amount || 0),
          0,
          100,
        );
      });
      if (trial.self)
        applyStatEffect(state, {
          id: 'boss-trial',
          title: 'boss-trial',
          line: trial.line,
          effect: trial.self,
        });
      this.battle.log.unshift(trial.line);
    } else {
      this.battle.log.unshift(phase || actionLine);
    }
    this.battle.log = this.battle.log.slice(0, 6);
  }

  private evaluate(): Outcome | '' {
    if (!this.battle) return '';
    const state = this.state();
    const c = this.battle.client;
    const stanceId = this.battle.stanceId || state.contractStanceId;
    if (
      stanceId === 'hard-boundary' &&
      (c.scope >= 96 || c.anger >= 98) &&
      c.trust >= 38 &&
      c.budget >= 26 &&
      state.stats.boundary >= 24
    ) {
      this.battle.flags.push('boundary-exit');
      this.battle.log.unshift(
        '边界先行触发主动终止：博哥把会拉回合同，先拿部分验收，不继续免费硬扛。',
      );
      return 'partial';
    }
    if (
      state.stats.energy <= 0 ||
      state.stats.patience <= 0 ||
      c.anger >= 100 ||
      c.scope >= 100 ||
      c.budget <= 0
    )
      return 'fail';
    const winTrust = stanceId === 'prepaid' ? 68 : 70;
    const winBudget = stanceId === 'prepaid' ? 42 : 50;
    if (
      c.trust >= winTrust &&
      c.budget >= winBudget &&
      c.anger <= 88 &&
      c.scope <= 84
    )
      return 'win';
    if (
      stanceId === 'milestone' &&
      this.battle.round >= 4 &&
      c.trust >= 52 &&
      c.budget >= 34 &&
      c.anger < 96 &&
      c.scope < 96
    ) {
      this.battle.flags.push('milestone-close');
      this.battle.log.unshift(
        '里程碑阶段结算：先把能验的验掉，剩下的写进下一阶段。',
      );
      return 'partial';
    }
    if (this.battle.round >= 6) {
      if (c.trust >= 44 && c.budget >= 30 && c.anger < 100) return 'partial';
      return 'fail';
    }
    return '';
  }

  private finish(outcome: Outcome): void {
    if (!this.quest || !this.battle) return;
    const state = this.state();
    const quest = this.quest;
    const before = {
      cash: state.stats.cash,
      reputation: state.stats.reputation,
      pressure: state.stats.pressure,
      xp: state.xp,
      issues: state.issues.length,
    };
    const wasRetry = state.failed.includes(quest.id);
    state.actionPoints = Math.max(0, state.actionPoints - quest.cost);
    const failureCost =
      80 + Math.max(0, state.cycle - 1) * 35 + state.issues.length * 8;
    let reward =
      outcome === 'win'
        ? quest.reward
        : outcome === 'partial'
          ? Math.floor(quest.reward * 0.58)
          : -failureCost;
    if (outcome === 'win' && hasRouteVow(state, 'business'))
      reward = Math.floor(reward * 1.12);
    if (outcome === 'partial' && hasRouteVow(state, 'delivery'))
      reward = Math.floor(reward * 1.08);
    const xp =
      outcome === 'win'
        ? quest.xp
        : outcome === 'partial'
          ? Math.floor(quest.xp * 0.62)
          : 12;
    state.stats.cash = Math.max(0, state.stats.cash + reward);
    state.xp += xp;
    state.stats.reputation = clamp(
      state.stats.reputation +
        (outcome === 'win' ? 9 : outcome === 'partial' ? 3 : -8),
      0,
      100,
    );
    state.stats.pressure = clamp(
      state.stats.pressure +
        (outcome === 'win' ? -10 : outcome === 'partial' ? 7 : 15),
      0,
      100,
    );
    const routeBeforeBoss = routeLeader(state);
    if (!quest.boss)
      state.routes[quest.route] = clamp(
        state.routes[quest.route] +
          (outcome === 'win' ? 14 : outcome === 'partial' ? 8 : 2),
        0,
        100,
      );
    state.relationships[quest.id] = clamp(
      (state.relationships[quest.id] || 0) +
        (outcome === 'win' ? 18 : outcome === 'partial' ? 7 : -12),
      -50,
      100,
    );

    if (outcome === 'win' || outcome === 'partial') {
      if (!state.completed.includes(quest.id)) state.completed.push(quest.id);
      state.failed = state.failed.filter((id) => id !== quest.id);
      delete state.locks[quest.id];
      settleSourceIssues(state, quest.id, outcome);
    } else if (!state.failed.includes(quest.id)) {
      state.failed.push(quest.id);
      state.locks[quest.id] = state.day + 1;
    }

    if (outcome !== 'win') {
      const stance = stanceById(this.battle.stanceId || state.contractStanceId);
      const shield =
        (state.perks.includes('sla-shield') ? 3 : 0) +
        (hasRouteVow(state, 'boundary') ? 3 : 0) +
        (hasLegacy(state, 'boundary') ? 2 : 0) +
        (stance?.id === 'hard-boundary' ? 3 : 0) +
        (outcome === 'partial' && hasRouteVow(state, 'delivery') ? 2 : 0) +
        (outcome === 'partial' && stance?.id === 'milestone' ? 3 : 0);
      state.issues.unshift({
        id: `${quest.id}-${Date.now()}`,
        sourceQuest: quest.id,
        ...quest.issue,
        severity: Math.max(
          3,
          (outcome === 'partial'
            ? Math.floor(quest.issue.severity * 0.56)
            : quest.issue.severity) - shield,
        ),
      });
      state.issues = state.issues.slice(0, 6);
    }
    if (quest.id === 'boss' && outcome === 'partial') {
      state.completed = state.completed.filter((id) => id !== 'boss');
      state.locks.boss = state.day + 1;
      addLog(state, '联合验收只给试运行：姐没盖章，姐是让你明天带复盘再来。');
    }
    if (quest.boss && hasRouteVow(state, 'shadow')) {
      state.stats.pressure = clamp(state.stats.pressure - 8, 0, 100);
      addLog(
        state,
        '影流专精：ShadowBo 在验收桌边递第三套说法，压力少炸一点。',
      );
    }
    applyManagementCrisis(state, quest, outcome);
    applyStanceSettlement(
      state,
      quest,
      outcome,
      this.battle.stanceId || state.contractStanceId,
    );
    recordCaseMemory(state, quest, outcome);
    syncProgression(state);
    claimProgressionRewards(state).forEach((line) => addLog(state, line));
    unlockAchievements(state, quest, outcome, wasRetry).forEach((line) =>
      addLog(state, line),
    );
    claimProgressionRewards(state).forEach((line) => addLog(state, line));

    if (quest.id === 'boss' && outcome === 'win') {
      const route = routeBeforeBoss;
      state.ending = {
        business: '商业封神线',
        delivery: '交付稳态线',
        boundary: 'SLA 宗师线',
        shadow: '影流整活隐藏线',
      }[route];
      if (!state.achievements.includes(`ending-${route}`))
        state.achievements.push(`ending-${route}`);
      grantLegacy(state, route).forEach((legacyLine) =>
        addLog(state, legacyLine),
      );
      addLog(
        state,
        `第 ${state.cycle} 周目结算：${state.ending}。${endingLine(route)}`,
      );
    }

    levelUp(state).forEach((line) => addLog(state, line));
    const variant = this.battle.variantId
      ? caseVariantById(this.battle.variantId)
      : undefined;
    const line =
      outcome === 'win'
        ? variant?.winLine || quest.winLine
        : outcome === 'partial'
          ? quest.partialLine
          : variant?.failLine || quest.failLine;
    addLog(state, `${labelOutcome(outcome)}：${quest.title}。${line}`);
    this.save();
    const delta = {
      cash: state.stats.cash - before.cash,
      reputation: state.stats.reputation - before.reputation,
      pressure: state.stats.pressure - before.pressure,
      xp,
      issues: state.issues.length - before.issues,
    };
    this.showResult(
      outcome,
      `${line}\n${storyAftermath(state, quest, outcome)}`,
      delta,
    );
  }

  private showResult(
    outcome: Outcome,
    line: string,
    delta: {
      cash: number;
      reputation: number;
      pressure: number;
      xp: number;
      issues: number;
    },
  ): void {
    this.modalLocked = true;
    const color =
      outcome === 'win'
        ? 0x173a34
        : outcome === 'partial'
          ? 0x433b20
          : 0x3a1f1b;
    const deltaLine = `现金 ${signedMoney(delta.cash)} · XP +${delta.xp} · 口碑 ${signed(delta.reputation)} · 压力 ${signed(delta.pressure)} · 遗留 ${signed(delta.issues)}`;
    if (this.isPortrait()) {
      const vw = this.viewW();
      const vh = this.viewH();
      this.add.rectangle(vw / 2, vh / 2, vw, vh, 0x000000, 0.5).setDepth(200);
      this.add
        .rectangle(vw / 2, vh / 2, vw - 28, 338, color, 0.98)
        .setStrokeStyle(3, 0xffdf86)
        .setDepth(201);
      addBoPhoto(
        this,
        vw / 2 - 144,
        vh / 2 - 112,
        92,
        88,
        outcome === 'win' ? 'win' : outcome === 'partial' ? 'shock' : 'fail',
        203,
      );
      this.add
        .text(
          vw / 2 + 34,
          vh / 2 - 104,
          labelOutcome(outcome),
          pixelText(23, '#ffe6a8', '900'),
        )
        .setOrigin(0.5)
        .setDepth(202);
      this.add
        .text(vw / 2 + 34, vh / 2 - 60, line, pixelText(13, '#fff4d7', '700'))
        .setOrigin(0.5, 0)
        .setWordWrapWidth(vw - 164)
        .setDepth(202);
      this.add
        .text(vw / 2, vh / 2 + 46, deltaLine, pixelText(11, '#d8f6ed', '900'))
        .setOrigin(0.5)
        .setWordWrapWidth(vw - 44)
        .setDepth(202);
      const next = this.state().ending ? '周目结算' : '回到地图';
      const button = makeSceneButton(
        this,
        72,
        vh / 2 + 112,
        vw - 144,
        44,
        next,
        () => this.returnToWorld(),
        0x285d72,
        false,
        13,
      );
      button.setDepth(203);
      this.add.existing(button);
      return;
    }
    this.add
      .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.46)
      .setDepth(200);
    this.add
      .rectangle(GAME_W / 2, GAME_H / 2, 640, 238, color, 0.98)
      .setStrokeStyle(3, 0xffdf86)
      .setDepth(201);
    addBoPhoto(
      this,
      GAME_W / 2 - 326,
      196,
      114,
      104,
      outcome === 'win' ? 'win' : outcome === 'partial' ? 'shock' : 'fail',
      203,
    );
    this.add
      .text(
        GAME_W / 2,
        184,
        labelOutcome(outcome),
        pixelText(28, '#ffe6a8', '900'),
      )
      .setOrigin(0.5)
      .setDepth(202);
    this.add
      .text(GAME_W / 2 + 46, 230, line, pixelText(15, '#fff4d7', '700'))
      .setOrigin(0.5, 0)
      .setWordWrapWidth(430)
      .setDepth(202);
    this.add
      .text(GAME_W / 2 + 46, 300, deltaLine, pixelText(12, '#d8f6ed', '900'))
      .setOrigin(0.5, 0)
      .setWordWrapWidth(430)
      .setDepth(202);
    const next = this.state().ending ? '周目结算' : '回到地图';
    const button = makeSceneButton(
      this,
      GAME_W / 2 - 92,
      338,
      184,
      42,
      next,
      () => this.returnToWorld(),
      0x285d72,
    );
    button.setDepth(203);
    this.add.existing(button);
  }

  private returnToWorld(): void {
    const state = this.state();
    if (state.ending && state.completed.includes('boss')) {
      const lastEnding = state.ending;
      state.cycle += 1;
      state.day += 1;
      state.chapter = 1;
      state.actionPoints = 3;
      state.mapId = 'office';
      state.player.office = { x: 232, y: 318 };
      state.completed = [];
      state.failed = [];
      state.issues = [];
      state.locks = {};
      state.weeklyGoalId = '';
      state.weeklyGoalStartedDay = 0;
      state.weeklyGoalBaseline = weeklyBaseline(state);
      applyLegacyStartBonus(state);
      state.stats.energy = clamp(state.stats.energy + 34, 0, 100);
      state.stats.patience = clamp(state.stats.patience + 34, 0, 100);
      state.stats.pressure = clamp(state.stats.pressure + 8, 0, 100);
      addLog(
        state,
        `第 ${state.cycle} 周目开始：客户刷新，但带着上周 ${lastEnding} 的名声来谈价。`,
      );
      state.ending = '';
    }
    this.save();
    this.scene.start('WorldScene');
  }

  private clientIntent(): string {
    if (!this.battle) return '客户正在观察博哥。';
    const c = this.battle.client;
    const highest = Object.entries({
      怒气: c.anger,
      预算压力: 100 - c.budget,
      需求蔓延: c.scope,
      信任缺口: 100 - c.trust,
    }).sort((a, b) => b[1] - a[1])[0][0];
    return `当前主要风险：${highest}`;
  }
}

function syncProgression(state: SaveState): void {
  const done = state.completed.filter((id) => id !== 'boss').length;
  const nextChapter = done >= 6 ? 3 : done >= 2 ? 2 : 1;
  if (nextChapter > state.chapter) {
    state.chapter = nextChapter;
    const flag = `chapter-${nextChapter}`;
    if (!state.storyFlags.includes(flag)) {
      state.storyFlags.push(flag);
      addLog(
        state,
        `${chapterTitle(nextChapter)}：客户的“顺手一下”开始升级。${CORE_REFRAINS[(nextChapter - 1) % CORE_REFRAINS.length]}`,
      );
    }
  } else {
    state.chapter = Math.max(state.chapter, nextChapter);
  }
}

function chapterTitle(chapter: number): string {
  if (chapter >= 3) return '第三幕：联合验收开庭';
  if (chapter >= 2) return '第二幕：顺手开始复用';
  return '第一幕：免费售后的入口';
}

function chapterObjective(state: SaveState): string {
  const done = state.completed.filter((id) => id !== 'boss').length;
  if (state.chapter >= 3)
    return `去客户现场打联合验收 Boss，当前遗留 ${state.issues.length} 项，Boss 材料 ${bossDocketCards(state).length}/${BOSS_DOCKET_CARDS.length}。`;
  if (state.chapter >= 2)
    return `处理高级客户，把“顺手一下”拆成报价、验收和 SLA；还差 ${Math.max(0, 6 - done)} 单和一条成型路线解锁 Boss。`;
  return `先处理 2 个入口客户，让免费售后变成可收费服务；当前 ${done}/2。`;
}

function routeLeader(state: SaveState): RouteKey {
  return Object.entries(state.routes).sort(
    (a, b) => b[1] - a[1],
  )[0][0] as RouteKey;
}

function routeLabel(route: RouteKey): string {
  return {
    business: '商业报价线',
    delivery: '交付验收线',
    boundary: 'SLA 边界线',
    shadow: '影流三方案线',
  }[route];
}

function routeShort(route: RouteKey): string {
  return {
    business: '报价',
    delivery: '交付',
    boundary: '边界',
    shadow: '影流',
  }[route];
}

function issueTypeLabel(type: Issue['type']): string {
  return {
    budget: '预算',
    sla: 'SLA',
    compliance: '合规',
    delivery: '交付',
    pressure: '压力',
  }[type];
}

function nextRouteMilestoneLine(state: SaveState): string {
  const next = ROUTE_MILESTONES.filter(
    (milestone) => state.routes[milestone.route] < milestone.threshold,
  ).sort(
    (a, b) =>
      a.threshold -
      state.routes[a.route] -
      (b.threshold - state.routes[b.route]),
  )[0];
  if (!next) return '四条路线已满，去联合验收把周目遗产带回家。';
  return `${next.title} 还差 ${Math.max(0, next.threshold - state.routes[next.route])} 点 · ${next.rewardLine}`;
}

function mapBlockers(
  mapId: MapId,
): Array<{ x: number; y: number; w: number; h: number }> {
  if (mapId === 'office') {
    return [
      { x: 82, y: 184, w: 150, h: 70 },
      { x: 142, y: 100, w: 112, h: 64 },
      { x: 686, y: 94, w: 144, h: 76 },
      { x: 752, y: 388, w: 132, h: 78 },
      { x: 58, y: 384, w: 124, h: 74 },
      { x: 574, y: 124, w: 220, h: 78 },
    ];
  }
  return [
    { x: 82, y: 130, w: 170, h: 92 },
    { x: 386, y: 72, w: 182, h: 76 },
    { x: 665, y: 174, w: 210, h: 88 },
    { x: 778, y: 386, w: 146, h: 76 },
  ];
}

function pushOutOfRect(
  player: Phaser.Physics.Arcade.Image,
  rect: { x: number; y: number; w: number; h: number },
): void {
  const halfW = 15;
  const halfH = 26;
  const left = rect.x - halfW;
  const right = rect.x + rect.w + halfW;
  const top = rect.y - halfH;
  const bottom = rect.y + rect.h + halfH;
  if (
    player.x <= left ||
    player.x >= right ||
    player.y <= top ||
    player.y >= bottom
  )
    return;
  const distances = [
    { axis: 'x', value: left - player.x, size: Math.abs(left - player.x) },
    { axis: 'x', value: right - player.x, size: Math.abs(right - player.x) },
    { axis: 'y', value: top - player.y, size: Math.abs(top - player.y) },
    { axis: 'y', value: bottom - player.y, size: Math.abs(bottom - player.y) },
  ].sort((a, b) => a.size - b.size)[0];
  if (distances.axis === 'x') player.x += distances.value;
  else player.y += distances.value;
}

function trainingRoute(training: TrainingKey): RouteKey {
  const routes: Record<TrainingKey, RouteKey> = {
    pricing: 'business',
    delivery: 'delivery',
    sla: 'boundary',
    recovery: 'boundary',
    shadow: 'shadow',
  };
  return routes[training];
}

function routeVows(state: SaveState): RouteKey[] {
  return (Object.keys(ROUTE_VOWS) as RouteKey[]).filter((route) =>
    state.perks.includes(ROUTE_VOWS[route].id),
  );
}

function routeVowSlots(state: SaveState): number {
  if (state.level >= 5 || state.cycle >= 2) return 2;
  if (state.level >= 2 || state.perks.length >= 2) return 1;
  return 0;
}

function availableRouteVows(state: SaveState): RouteKey[] {
  if (routeVows(state).length >= routeVowSlots(state)) return [];
  return (Object.keys(ROUTE_VOWS) as RouteKey[]).filter(
    (route) => !state.perks.includes(ROUTE_VOWS[route].id),
  );
}

function hasRouteVow(state: SaveState, route: RouteKey): boolean {
  return state.perks.includes(ROUTE_VOWS[route].id);
}

function stanceById(id: string): ContractStanceDefinition | undefined {
  return CONTRACT_STANCES.find((stance) => stance.id === id);
}

function selectedStance(state: SaveState): ContractStanceDefinition {
  const selected = stanceById(state.contractStanceId);
  if (
    selected &&
    availableStances(state).some((stance) => stance.id === selected.id)
  )
    return selected;
  state.contractStanceId = 'standard';
  return CONTRACT_STANCES[0];
}

function availableStances(state: SaveState): ContractStanceDefinition[] {
  return CONTRACT_STANCES.filter((stance) => {
    if (stance.id === 'standard') return true;
    if (
      hasRouteVow(state, stance.route) ||
      hasLegacy(state, stance.route) ||
      state.routes[stance.route] >= 20
    )
      return true;
    if (stance.id === 'prepaid') return state.training.pricing >= 1;
    if (stance.id === 'milestone') return state.training.delivery >= 1;
    if (stance.id === 'hard-boundary') return state.training.sla >= 1;
    if (stance.id === 'shadow-alt') return state.training.shadow >= 1;
    return false;
  });
}

function refusedReviewFlag(state: SaveState, questId: string): string {
  return `refuse-review:${state.cycle}:${questId}`;
}

function refusedReviewDone(state: SaveState, questId: string): boolean {
  return state.storyFlags.includes(refusedReviewFlag(state, questId));
}

function fieldOperationKey(
  state: SaveState,
  operation: FieldOperationDefinition,
): string {
  return `field:${state.cycle}:${state.day}:${operation.id}`;
}

function fieldOperationDone(
  state: SaveState,
  operation: FieldOperationDefinition,
): boolean {
  return state.storyFlags.includes(fieldOperationKey(state, operation));
}

function fieldOperationsFor(
  state: SaveState,
  hotspot: MapHotspot,
): FieldOperationDefinition[] {
  return FIELD_OPERATIONS.filter(
    (operation) =>
      operation.mapId === state.mapId && operation.hotspotId === hotspot.id,
  );
}

function clearFieldIssue(
  state: SaveState,
  type?: Issue['type'],
): Issue | undefined {
  if (!type) return undefined;
  let index = state.issues.findIndex((issue) => issue.type === type);
  if (index < 0 && type === 'sla')
    index = state.issues.findIndex((issue) => issue.type === 'pressure');
  if (index < 0) return undefined;
  const [cleared] = state.issues.splice(index, 1);
  return cleared;
}

function selectedWeeklyGoal(state: SaveState): WeeklyGoalDefinition | null {
  return (
    weeklyGoalChoices(state).find((goal) => goal.id === state.weeklyGoalId) ||
    null
  );
}

function currentWeeklyGoal(state: SaveState): WeeklyGoalDefinition {
  return selectedWeeklyGoal(state) || weeklyGoalChoices(state)[0];
}

function weeklyGoalChoices(state: SaveState): WeeklyGoalDefinition[] {
  const start = (state.cycle - 1) % WEEKLY_GOALS.length;
  return [0, 1, 2].map(
    (offset) => WEEKLY_GOALS[(start + offset) % WEEKLY_GOALS.length],
  );
}

function weeklyBaseline(state: SaveState): SaveState['weeklyGoalBaseline'] {
  return {
    cash: state.stats.cash,
    trust: positiveTrust(state),
    shadow: state.routes.shadow,
    completed: state.completed.filter((id) => id !== 'boss').length,
    comeback: state.achievements.includes('comeback-week') ? 1 : 0,
  };
}

function positiveTrust(state: SaveState): number {
  return Object.values(state.relationships).reduce(
    (sum, value) => sum + Math.max(0, value),
    0,
  );
}

function weeklyGoalProgress(
  state: SaveState,
  goal = currentWeeklyGoal(state),
): number {
  const baseline = state.weeklyGoalBaseline || weeklyBaseline(state);
  if (goal.id === 'cash-week')
    return Math.min(goal.target, Math.max(0, state.stats.cash - baseline.cash));
  if (goal.id === 'trust-week')
    return Math.min(
      goal.target,
      Math.max(0, positiveTrust(state) - baseline.trust),
    );
  if (goal.id === 'clean-week')
    return state.chapter >= 3 && state.issues.length <= goal.target
      ? goal.target
      : 0;
  if (goal.id === 'shadow-week')
    return Math.min(
      goal.target,
      Math.max(0, state.routes.shadow - baseline.shadow) +
        (state.completed.some((id) =>
          ['private', 'cost', 'shadow'].includes(id),
        )
          ? 10
          : 0),
    );
  if (goal.id === 'comeback-week-goal')
    return Math.max(
      0,
      (state.achievements.includes('comeback-week') ? 1 : 0) -
        baseline.comeback,
    );
  if (goal.id === 'boss-week-goal')
    return Math.min(
      goal.target,
      Math.max(
        0,
        state.completed.filter((id) => id !== 'boss').length -
          baseline.completed,
      ),
    );
  return 0;
}

function weeklyGoalComplete(
  state: SaveState,
  goal = currentWeeklyGoal(state),
): boolean {
  if (goal.id === 'clean-week')
    return state.chapter >= 3 && state.issues.length <= goal.target;
  return weeklyGoalProgress(state, goal) >= goal.target;
}

function weeklyRewardKey(
  state: SaveState,
  goal = currentWeeklyGoal(state),
): string {
  return `week-${state.cycle}-${goal.id}`;
}

function longTermGoalKey(id: string): string {
  return `long-goal-${id}`;
}

function longTermGoalClaimed(state: SaveState, id: string): boolean {
  return state.claimedRewards.includes(longTermGoalKey(id));
}

function longTermGoalProgress(
  state: SaveState,
  goal: LongTermGoalDefinition,
): number {
  if (goal.metric === 'route')
    return Math.min(goal.target, state.routes[goal.route]);
  if (goal.metric === 'completed')
    return Math.min(
      goal.target,
      state.completed.filter((id) => id !== 'boss').length,
    );
  if (goal.metric === 'codex')
    return Math.min(goal.target, unlockedStoryCount(state));
  if (goal.metric === 'relationships')
    return Math.min(goal.target, positiveTrust(state));
  if (goal.metric === 'clean-boss')
    return state.completed.includes('boss') && state.issues.length === 0
      ? 1
      : 0;
  if (goal.metric === 'legacies')
    return Math.min(
      goal.target,
      LEGACIES.filter((legacy) => hasLegacy(state, legacy.route)).length,
    );
  if (goal.metric === 'cash') return Math.min(goal.target, state.stats.cash);
  return 0;
}

function longTermGoalComplete(
  state: SaveState,
  goal: LongTermGoalDefinition,
): boolean {
  return longTermGoalProgress(state, goal) >= goal.target;
}

function nextLongTermGoal(
  state: SaveState,
): LongTermGoalDefinition | undefined {
  return LONG_TERM_GOALS.find((goal) => !longTermGoalClaimed(state, goal.id));
}

function bossDocketCards(state: SaveState) {
  return BOSS_DOCKET_CARDS.filter((card) =>
    longTermGoalClaimed(state, card.id),
  );
}

function claimProgressionRewards(state: SaveState): string[] {
  const lines: string[] = [];
  const claim = (id: string, line: string, effect: () => void) => {
    if (state.claimedRewards.includes(id)) return;
    state.claimedRewards.push(id);
    effect();
    lines.push(line);
  };
  const weekly = currentWeeklyGoal(state);
  if (selectedWeeklyGoal(state) && weeklyGoalComplete(state, weekly)) {
    claim(weeklyRewardKey(state, weekly), weekly.rewardLine, () => {
      state.routes[weekly.route] = clamp(
        state.routes[weekly.route] + 8,
        0,
        100,
      );
      if (weekly.route === 'business')
        state.stats.cash = clamp(state.stats.cash + 120, 0, 99999);
      if (weekly.route === 'delivery')
        state.stats.reputation = clamp(state.stats.reputation + 6, 0, 100);
      if (weekly.route === 'boundary') {
        state.stats.boundary = clamp(state.stats.boundary + 8, 0, 100);
        state.stats.pressure = clamp(state.stats.pressure - 10, 0, 100);
      }
      if (weekly.route === 'shadow')
        state.stats.patience = clamp(state.stats.patience + 8, 0, 100);
    });
  }
  LONG_TERM_GOALS.forEach((goal) => {
    if (!longTermGoalComplete(state, goal)) return;
    claim(
      longTermGoalKey(goal.id),
      `${goal.title} 完成：${goal.storyLine}\n${goal.rewardLine}`,
      () => {
        applyLongTermGoalReward(state, goal);
        if (!state.storyFlags.includes(`long-goal:${goal.id}`))
          state.storyFlags.push(`long-goal:${goal.id}`);
      },
    );
  });
  [3, 6, 9, 12].forEach((count) => {
    if (state.achievements.length >= count) {
      claim(
        `codex-ach-${count}`,
        `案卷奖励：成就达到 ${count} 个，博哥经营底盘变厚。`,
        () => {
          state.stats.cash = clamp(state.stats.cash + count * 24, 0, 99999);
          state.stats.reputation = clamp(
            state.stats.reputation + Math.floor(count / 3),
            0,
            100,
          );
        },
      );
    }
  });
  if (unlockedStoryCount(state) >= 5) {
    claim(
      'codex-story-5',
      '案卷奖励：故事卡解锁 5 张，客户记忆开始反哺谈判。',
      () => {
        state.stats.patience = clamp(state.stats.patience + 6, 0, 100);
        state.stats.boundary = clamp(state.stats.boundary + 4, 0, 100);
      },
    );
  }
  ROUTE_MILESTONES.forEach((milestone) => {
    if (state.routes[milestone.route] >= milestone.threshold) {
      claim(
        `route-${milestone.id}`,
        `${milestone.title}：${milestone.line}\n${milestone.rewardLine}`,
        () => {
          applyStatEffect(state, { effect: milestone.effect });
          if (!state.storyFlags.includes(`route:${milestone.id}`))
            state.storyFlags.push(`route:${milestone.id}`);
        },
      );
    }
  });
  return lines;
}

function applyLongTermGoalReward(
  state: SaveState,
  goal: LongTermGoalDefinition,
): void {
  state.routes[goal.route] = clamp(state.routes[goal.route] + 10, 0, 100);
  if (goal.id === 'ledger-master') {
    state.stats.cash = clamp(state.stats.cash + 260, 0, 99999);
    state.stats.pressure = clamp(state.stats.pressure - 6, 0, 100);
  } else if (goal.id === 'delivery-handbook') {
    state.stats.reputation = clamp(state.stats.reputation + 10, 0, 100);
    state.stats.patience = clamp(state.stats.patience + 8, 0, 100);
  } else if (goal.id === 'sla-wall') {
    state.stats.boundary = clamp(state.stats.boundary + 12, 0, 100);
    state.stats.pressure = clamp(state.stats.pressure - 10, 0, 100);
  } else if (goal.id === 'shadow-director') {
    state.stats.patience = clamp(state.stats.patience + 12, 0, 100);
    state.stats.cash = clamp(state.stats.cash + 120, 0, 99999);
  } else if (goal.id === 'ten-case-office') {
    state.stats.reputation = clamp(state.stats.reputation + 8, 0, 100);
    state.stats.cash = clamp(state.stats.cash + 120, 0, 99999);
  } else if (goal.id === 'case-archive-collector') {
    state.stats.pressure = clamp(state.stats.pressure - 14, 0, 100);
    state.stats.boundary = clamp(state.stats.boundary + 6, 0, 100);
    const cleared = state.issues.shift();
    if (cleared)
      addLog(
        state,
        `长期案卷清债：${cleared.label} 被整理成证据，不再压在桌面最上层。`,
      );
  } else if (goal.id === 'client-trust-network') {
    state.stats.reputation = clamp(state.stats.reputation + 12, 0, 100);
    state.stats.patience = clamp(state.stats.patience + 6, 0, 100);
  } else if (goal.id === 'clean-boss-docket') {
    state.stats.boundary = clamp(state.stats.boundary + 10, 0, 100);
    state.stats.pressure = clamp(state.stats.pressure - 16, 0, 100);
  } else if (goal.id === 'legacy-quartet') {
    state.xp += 120;
    state.stats.cash = clamp(state.stats.cash + 240, 0, 99999);
    state.stats.patience = clamp(state.stats.patience + 8, 0, 100);
  } else if (goal.id === 'cashflow-fortress') {
    state.stats.cash = clamp(state.stats.cash + 180, 0, 99999);
    state.stats.pressure = clamp(state.stats.pressure - 18, 0, 100);
  }
}

function activeCaseVariant(
  state: SaveState,
  quest: QuestDefinition,
): CaseVariantDefinition | undefined {
  const candidates = CASE_VARIANTS.filter(
    (variant) =>
      variant.questId === quest.id && caseVariantApplies(state, variant),
  );
  if (!candidates.length) return undefined;
  const index =
    Math.abs(
      hashText(
        `${state.day}:${state.cycle}:${quest.id}:${state.completed.join(',')}:${state.failed.join(',')}`,
      ),
    ) % candidates.length;
  return candidates[index];
}

function caseVariantById(id: string): CaseVariantDefinition | undefined {
  return CASE_VARIANTS.find((variant) => variant.id === id);
}

const CASE_VARIANT_CONDITIONS: Record<string, (state: SaveState) => boolean> = {
  'gpu-month-end': (state) =>
    state.stats.cash < 500 ||
    state.issues.some((issue) => issue.type === 'budget'),
  'gpu-board-report': (state) =>
    state.routes.business >= routeLeaderValue(state, 'business'),
  'agent-crm-creep': (state) =>
    state.issues.some((issue) => issue.type === 'delivery') ||
    state.completed.includes('agent'),
  'agent-demo-stage': (state) => state.stats.reputation >= 55,
  'sla-group-court': (state) =>
    state.issues.some((issue) => issue.type === 'sla'),
  'sla-vip-room': (state) => state.cycle >= 2,
  'private-audit-night': (state) =>
    state.issues.some((issue) => issue.type === 'compliance'),
  'private-offline-all': (state) => state.training.sla < 2,
  'cost-free-dashboard': (state) =>
    state.issues.some((issue) => issue.label.includes('免费')),
  'cost-threshold-loop': (state) =>
    state.completed.includes('cost') || state.failed.includes('cost'),
  'shadow-fourth-plan': (state) => routeLeader(state) === 'shadow',
  'shadow-rival-copy': (state) => state.day >= 3,
  'voicebot-refund-gift': (state) =>
    state.failed.includes('voicebot') ||
    state.issues.some((issue) => issue.type === 'delivery'),
  'voicebot-knowledge-hole': (state) =>
    state.routes.shadow >= 20 ||
    state.completed.includes('datapack') ||
    state.completed.includes('voicebot'),
  'quota-rival-cut': (state) => state.day >= 3 || state.routes.business >= 35,
  'quota-midnight-train': (state) =>
    state.stats.pressure >= 55 || state.stats.cash < 600,
  'migration-db-freeze': (state) =>
    state.issues.some((issue) => issue.type === 'sla') ||
    state.training.sla < 2,
  'migration-license-trap': (state) =>
    state.issues.some((issue) => issue.type === 'compliance') ||
    state.completed.includes('private'),
  'live-kol-surprise': (state) =>
    state.stats.reputation >= 55 ||
    state.completed.includes('live') ||
    state.failed.includes('live'),
  'live-payment-chain': (state) =>
    state.issues.some(
      (issue) => issue.type === 'budget' || issue.type === 'pressure',
    ),
  'security-false-positive': (state) =>
    state.day >= 4 || state.issues.some((issue) => issue.type === 'compliance'),
  'security-ciso-room': (state) =>
    state.chapter >= 3 ||
    state.issues.some((issue) => issue.type === 'compliance'),
  'invoice-procurement-loop': (state) =>
    state.stats.cash < 700 ||
    state.issues.some((issue) => issue.type === 'budget'),
  'invoice-entity-swap': (state) =>
    state.failed.includes('invoice') || state.completed.includes('invoice'),
  'datapack-dirty-json': (state) =>
    state.failed.includes('datapack') || state.stats.pressure >= 55,
  'datapack-permission-maze': (state) =>
    state.routes.boundary >= 35 ||
    state.issues.some((issue) => issue.type === 'compliance'),
  'vip-midnight-call': (state) =>
    state.failed.includes('vip') || state.stats.pressure >= 60,
  'vip-board-seat': (state) =>
    state.stats.reputation >= 60 || state.routes.business >= 45,
  'boss-budget-trial': (state) =>
    state.issues.filter((issue) => issue.type === 'budget').length >= 1,
  'boss-sla-trial': (state) =>
    state.issues.filter((issue) => issue.type === 'sla').length >= 1,
  'boss-shadow-trial': (state) => routeLeader(state) === 'shadow',
  'boss-delivery-trial': (state) =>
    state.issues.filter((issue) => issue.type === 'delivery').length >= 1,
  'boss-compliance-trial': (state) =>
    state.issues.filter((issue) => issue.type === 'compliance').length >= 1,
  'boss-pressure-trial': (state) =>
    state.issues.filter((issue) => issue.type === 'pressure').length >= 1 ||
    state.stats.pressure >= 70,
};

function caseVariantApplies(
  state: SaveState,
  variant: CaseVariantDefinition,
): boolean {
  return CASE_VARIANT_CONDITIONS[variant.id]?.(state) ?? true;
}

function routeLeaderValue(state: SaveState, route: RouteKey): number {
  return Math.max(
    ...Object.entries(state.routes)
      .filter(([key]) => key !== route)
      .map(([, value]) => value),
    0,
  );
}

function caseVariantEffectLine(variant: CaseVariantDefinition): string {
  return Object.entries(variant.effect)
    .map(
      ([key, value]) =>
        `${clientStatLabel(key as keyof ClientStats)}${signed(value || 0)}`,
    )
    .join(' / ');
}

function clientStatLabel(stat: keyof ClientStats): string {
  return { anger: '怒气', budget: '预算', scope: '蔓延', trust: '信任' }[stat];
}

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1)
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return hash;
}

function questMemoryLine(state: SaveState, quest: QuestDefinition): string {
  const issue = state.issues[0];
  const relationship = state.relationships[quest.id] || 0;
  const relLine =
    relationship > 12
      ? '客户记得上次博哥把话说明白了，这次开局没那么冲。'
      : relationship < -8
        ? '客户记得上次没谈拢，今天一上来就带着旧账。'
        : '';
  if (!issue) return relLine;
  const byType: Record<Issue['type'], string> = {
    budget: `旧账回声：${issue.label} 还在群里发酵，客户拿截图问“你上次不是能送吗？”`,
    sla: `旧账回声：${issue.label} 没结干净，客户开口就是“上次两秒你们都认了”。`,
    compliance: `旧账回声：${issue.label} 还没归档，安全红字又压到桌面上。`,
    delivery: `旧账回声：${issue.label} 还在追，客户把 POC 念成全量上线。`,
    pressure: `旧账回声：${issue.label} 堆着没散，会议室空气开始计费。`,
  };
  return [byType[issue.type], relLine].filter(Boolean).join('\n');
}

function bossDocketLine(state: SaveState): string {
  const cards = bossDocketCards(state);
  const prepared = cards.length
    ? `已备 ${cards.length} 份：${cards
        .slice(0, 4)
        .map((card) => card.title.replace('Boss 材料：', ''))
        .join(' / ')}`
    : '暂无可展示材料';
  if (!state.issues.length) return `Boss 材料：无遗留旧账；${prepared}。`;
  return `Boss 审判材料：${state.issues.map((issue) => `${issue.label}+${issue.severity} ${bossIssueShortEffect(issue.type)}`).join(' / ')}\nBoss 准备：${prepared}`;
}

function bossIssueShortEffect(type: Issue['type']): string {
  return {
    budget: '压预算',
    sla: '升怒气',
    compliance: '涨蔓延',
    delivery: '降信任',
    pressure: '耗资源',
  }[type];
}

function bossIssueTrial(issue: Issue): {
  line: string;
  effect: Partial<ClientStats>;
  self?: Partial<SaveState['stats']>;
} {
  const source = questById(issue.sourceQuest)?.title || issue.label;
  if (issue.type === 'budget') {
    return {
      line: `验收组翻旧账：${source} 那张截图还在。姐问，这钱到底咋收？预算上限被压住。`,
      effect: { budget: -10, anger: 5 },
    };
  }
  if (issue.type === 'sla') {
    return {
      line: `验收组点名：${source} 的两秒事故没关干净。别讲感情，讲责任。`,
      effect: { anger: 13, trust: -4 },
    };
  }
  if (issue.type === 'compliance') {
    return {
      line: `合规姐把 ${source} 的红字拍桌上：材料呢？范围又往外长了一圈。`,
      effect: { scope: 14, budget: -4 },
    };
  }
  if (issue.type === 'delivery') {
    return {
      line: `老板姐追问 ${source}：POC 都跑了，全量上线不是顺手吗？信任开始漏。`,
      effect: { trust: -12, scope: 8 },
    };
  }
  return {
    line: `联合验收把 ${source} 并成一口大锅。博哥嘴都说干了，压力继续往上顶。`,
    effect: { anger: 6, scope: 7 },
    self: { patience: -7, pressure: 6 },
  };
}

function dailyOperatingCost(state: SaveState): number {
  const base = 38 + state.cycle * 10;
  const clientMaintenance =
    state.completed.filter((id) => id !== 'boss').length * 12;
  const issueMaintenance = state.issues.reduce(
    (sum, issue) => sum + Math.ceil(issue.severity * 1.8),
    0,
  );
  const reputationDiscount =
    state.stats.reputation >= 60 ? 18 : state.stats.reputation >= 45 ? 8 : 0;
  const businessDiscount = hasLegacy(state, 'business') ? 16 : 0;
  const cashflowDiscount = longTermGoalClaimed(state, 'cashflow-fortress')
    ? 24
    : 0;
  return Math.max(
    0,
    Math.floor(
      base +
        clientMaintenance +
        issueMaintenance -
        reputationDiscount -
        businessDiscount -
        cashflowDiscount,
    ),
  );
}

function pickDailyEvent(state: SaveState): EventDefinition {
  const first = state.issues[0];
  if (first) {
    const preferred = {
      budget: 'finance-shot',
      sla: 'boss-meeting',
      compliance: 'compliance',
      delivery: 'alarm',
      pressure: 'quiet-review',
    }[first.type];
    const event = EVENTS.find((item) => item.id === preferred);
    if (event && (state.day + first.severity) % 2 === 0) return event;
  }
  return EVENTS[
    (state.day +
      state.completed.length * 2 +
      state.failed.length +
      state.cycle) %
      EVENTS.length
  ];
}

function skillEffectSummary(skill: SkillDefinition): string {
  const label: Record<keyof ClientStats, string> = {
    anger: '怒',
    budget: '预算',
    scope: '蔓',
    trust: '信',
  };
  return Object.entries(skill.effect)
    .map(
      ([key, amount]) =>
        `${label[key as keyof ClientStats]}${signed(amount || 0)}`,
    )
    .join(' ');
}

function skillSlots(state: SaveState): number {
  const legacy = hasLegacy(state, 'shadow') ? 1 : 0;
  if (state.level >= 5 || state.cycle >= 2) return Math.min(7, 6 + legacy);
  if (state.level >= 3) return 5 + legacy;
  return 4 + legacy;
}

function skillById(id: string): SkillDefinition | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

function normalizeEquippedSkills(state: SaveState): void {
  const slots = skillSlots(state);
  const unlocked = new Set(
    SKILLS.filter((skill) => skillUnlocked(state, skill)).map(
      (skill) => skill.id,
    ),
  );
  state.equippedSkills = state.equippedSkills
    .filter((id) => unlocked.has(id))
    .slice(0, slots);
  if (state.equippedSkills.length === 0)
    state.equippedSkills = recommendedSkills(state, undefined, slots).map(
      (skill) => skill.id,
    );
}

function equippedSkillIds(state: SaveState): string[] {
  normalizeEquippedSkills(state);
  return state.equippedSkills.slice(0, skillSlots(state));
}

function recommendedSkills(
  state: SaveState,
  quest?: QuestDefinition,
  limit = skillSlots(state),
): SkillDefinition[] {
  return sortedUnlockedSkills(state, quest).slice(0, limit);
}

function sortedUnlockedSkills(
  state: SaveState,
  quest?: QuestDefinition,
): SkillDefinition[] {
  return SKILLS.filter((skill) => skillUnlocked(state, skill)).sort((a, b) => {
    const score = (skill: SkillDefinition) => {
      let value = 0;
      if (quest?.preferred?.includes(skill.training as TrainingKey))
        value += 40;
      if (hasRouteVow(state, skill.category)) value += 30;
      if (skill.category === quest?.route) value += 18;
      if (skill.training && state.training[skill.training] > 0)
        value += state.training[skill.training] * 4;
      value += skill.unlockLevel;
      return value;
    };
    return score(b) - score(a);
  });
}

function sortedBattleSkills(
  state: SaveState,
  quest?: QuestDefinition,
): SkillDefinition[] {
  if (!quest) return sortedUnlockedSkills(state);
  const ids = equippedSkillIds(state);
  const scoreOrder = new Map(
    sortedUnlockedSkills(state, quest).map((skill, index) => [skill.id, index]),
  );
  return ids
    .map((id) => skillById(id))
    .filter((skill): skill is SkillDefinition => Boolean(skill))
    .sort(
      (a, b) => (scoreOrder.get(a.id) || 999) - (scoreOrder.get(b.id) || 999),
    );
}

function skillUnlocked(state: SaveState, skill: SkillDefinition): boolean {
  if (skill.unlockLevel <= state.level) return true;
  if (!skill.training) return false;
  return state.training[skill.training] >= Math.max(1, skill.unlockLevel - 1);
}

function skillPerkBonus(
  state: SaveState,
  skill: SkillDefinition,
  stat: keyof ClientStats,
): number {
  if (
    skill.category === 'business' &&
    stat === 'budget' &&
    state.perks.includes('quote-ledger')
  )
    return 5;
  if (
    skill.category === 'delivery' &&
    stat === 'trust' &&
    state.perks.includes('poc-playbook')
  )
    return 5;
  if (
    skill.category === 'boundary' &&
    (stat === 'scope' || stat === 'anger') &&
    state.perks.includes('sla-shield')
  )
    return 4;
  if (skill.category === 'shadow' && state.perks.includes('shadow-clone'))
    return 4;
  if (
    skill.category === 'business' &&
    stat === 'budget' &&
    hasRouteVow(state, 'business')
  )
    return 7;
  if (
    skill.category === 'delivery' &&
    stat === 'trust' &&
    hasRouteVow(state, 'delivery')
  )
    return 7;
  if (
    skill.category === 'boundary' &&
    stat === 'scope' &&
    hasRouteVow(state, 'boundary')
  )
    return 8;
  if (skill.category === 'shadow' && hasRouteVow(state, 'shadow')) return 6;
  if (
    skill.category === 'business' &&
    stat === 'budget' &&
    hasLegacy(state, 'business')
  )
    return 3;
  if (
    skill.category === 'delivery' &&
    stat === 'trust' &&
    hasLegacy(state, 'delivery')
  )
    return 3;
  if (
    skill.category === 'boundary' &&
    (stat === 'scope' || stat === 'anger') &&
    hasLegacy(state, 'boundary')
  )
    return 3;
  if (skill.category === 'shadow' && hasLegacy(state, 'shadow')) return 3;
  return 0;
}

function unlockAchievements(
  state: SaveState,
  quest: QuestDefinition,
  outcome: Outcome,
  wasRetry: boolean,
): string[] {
  const lines: string[] = [];
  const add = (id: string, line: string) => {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id);
      lines.push(`成就：${line}`);
    }
  };
  if (outcome === 'win' && quest.id === 'gpu')
    add('first-paid-ledger', '第一张收费表');
  if (
    outcome === 'win' &&
    state.completed.filter((id) => id !== 'boss').length >= 6
  )
    add('boss-ready', '联合验收入场券');
  if (outcome === 'partial') add('first-gray-acceptance', '灰度通过');
  if (outcome === 'fail') add('first-bad-debt', '第一次售后债');
  if (outcome === 'win' && wasRetry) add('comeback-week', '这锅我又捡回来了');
  if (
    !quest.boss &&
    state.completed.filter((id) => id !== 'boss').length >= 6 &&
    state.issues.length === 0
  )
    add('clean-docket', '干净案卷');
  if (state.perks.length >= 3) add('build-online', '博哥构筑成型');
  return lines;
}

function settleSourceIssues(
  state: SaveState,
  questId: string,
  outcome: Outcome,
): void {
  const before = state.issues.length;
  if (outcome === 'win') {
    state.issues = state.issues.filter(
      (issue) => issue.sourceQuest !== questId,
    );
    if (state.issues.length < before)
      addLog(state, '旧账结清：这锅被捞回来了，客户没法再拿同一张截图追杀。');
    return;
  }
  state.issues = state.issues.map((issue) =>
    issue.sourceQuest === questId
      ? {
          ...issue,
          severity: Math.max(2, Math.floor(issue.severity * 0.55)),
          label: `${issue.label}复盘`,
        }
      : issue,
  );
  if (state.issues.some((issue) => issue.sourceQuest === questId))
    addLog(state, '灰度止血：同源旧账降级，但还会在 Boss 桌上冒头。');
}

function applyManagementCrisis(
  state: SaveState,
  quest: QuestDefinition,
  outcome: Outcome,
): void {
  const crisis =
    state.stats.pressure >= 96 ||
    (state.stats.cash <= 0 && state.issues.length > 0);
  if (!crisis) return;
  const route = routeLeader(state);
  state.stats.pressure = clamp(state.stats.pressure - 24, 0, 100);
  state.stats.reputation = clamp(state.stats.reputation - 8, 0, 100);
  state.routes[route] = clamp(state.routes[route] - 10, 0, 100);
  state.locks[quest.id] = Math.max(state.locks[quest.id] || 0, state.day + 2);
  state.issues.unshift({
    id: `crisis-${Date.now()}`,
    label: '强制低价和解',
    type: 'pressure',
    severity: outcome === 'fail' ? 14 : 9,
    sourceQuest: quest.id,
  });
  state.issues = state.issues.slice(0, 6);
  addLog(
    state,
    '经营危机：压力爆表，博哥被迫低价和解。不是死档，但这周 Boss 会拿这个说事。',
  );
}

function applyStanceSettlement(
  state: SaveState,
  quest: QuestDefinition,
  outcome: Outcome,
  stanceId: string,
): void {
  const stance = stanceById(stanceId);
  if (!stance || stance.id === 'standard') return;
  state.routes[stance.route] = clamp(
    state.routes[stance.route] +
      (outcome === 'win' ? 5 : outcome === 'partial' ? 3 : 1),
    0,
    100,
  );
  if (stance.id === 'prepaid') {
    if (outcome === 'fail') {
      state.stats.reputation = clamp(state.stats.reputation - 4, 0, 100);
      addLog(state, '预收款后翻车：钱先活了，口碑挨了一下。');
    } else {
      state.stats.cash = clamp(
        state.stats.cash + (outcome === 'win' ? 70 : 35),
        0,
        99999,
      );
      addLog(state, '商业预收款：回款节点前移，现金流没被客户拖死。');
    }
  }
  if (stance.id === 'milestone' && outcome === 'partial') {
    state.stats.pressure = clamp(state.stats.pressure - 8, 0, 100);
    addLog(state, '里程碑止血：部分成功被拆成下一阶段，不算全锅扣头上。');
  }
  if (stance.id === 'hard-boundary') {
    const issue = state.issues.find((item) => item.sourceQuest === quest.id);
    if (issue) issue.severity = Math.max(2, issue.severity - 3);
    addLog(state, '边界先行：气氛硬了点，但后续追责小了一圈。');
  }
  if (stance.id === 'shadow-alt') {
    if (outcome === 'win') {
      state.stats.cash = clamp(state.stats.cash + 45, 0, 99999);
      addLog(state, '影流替代方案：客户选得很开心，博哥收得也不亏。');
    } else {
      state.stats.pressure = clamp(state.stats.pressure + 5, 0, 100);
      addLog(state, '影流替代方案：方案多了，后续解释也多了。');
    }
  }
}

function recordCaseMemory(
  state: SaveState,
  quest: QuestDefinition,
  outcome: Outcome,
): void {
  const memory = CASE_MEMORIES.find(
    (item) => item.questId === quest.id && item.outcome === outcome,
  );
  if (!memory) return;
  const flag = `memory:${memory.id}`;
  if (state.storyFlags.includes(flag)) return;
  state.storyFlags.push(flag);
  addLog(state, `剧情案卷：${memory.title}。`);
}

function caseMemoryUnlocked(state: SaveState, id: string): boolean {
  return state.storyFlags.includes(`memory:${id}`);
}

function hasLegacy(state: SaveState, route: RouteKey): boolean {
  return state.storyFlags.includes(`legacy:${route}`);
}

function grantLegacy(state: SaveState, route: RouteKey): string[] {
  const legacy = LEGACIES.find((item) => item.route === route);
  if (!legacy || hasLegacy(state, route)) return [];
  state.storyFlags.push(`legacy:${route}`);
  applyStatEffect(state, { effect: legacy.effect });
  return [`${legacy.title}：${legacy.line}${legacy.effectLine}`];
}

function applyLegacyStartBonus(state: SaveState): void {
  LEGACIES.filter((legacy) => hasLegacy(state, legacy.route)).forEach(
    (legacy) => applyStatEffect(state, { effect: legacy.effect }),
  );
}

function achievementHint(id: string): string {
  return (
    ACHIEVEMENTS.find((item) => item.id === id)?.description || '继续经营解锁。'
  );
}

function storyCardUnlocked(state: SaveState, id: string): boolean {
  if (id === 'opening') return state.storyIntroSeen;
  if (id === 'chapter-2')
    return state.chapter >= 2 || state.storyFlags.includes('chapter-2');
  if (id === 'chapter-3')
    return state.chapter >= 3 || state.storyFlags.includes('chapter-3');
  if (id.startsWith('route:')) return state.storyFlags.includes(id);
  if (id.startsWith('long-goal:')) return state.storyFlags.includes(id);
  return state.achievements.includes(id);
}

function unlockedStoryCount(state: SaveState): number {
  return (
    STORY_CARDS.filter((card) => storyCardUnlocked(state, card.id)).length +
    CASE_MEMORIES.filter((memory) => caseMemoryUnlocked(state, memory.id))
      .length +
    LONG_TERM_GOALS.filter((goal) => longTermGoalClaimed(state, goal.id)).length
  );
}

function storyAftermath(
  state: SaveState,
  quest: QuestDefinition,
  outcome: Outcome,
): string {
  if (quest.boss && outcome !== 'fail')
    return `${endingLine(routeLeader(state))}\n已写入结局图鉴，下周目客户会更难，但特质和路线名声保留。`;
  if (outcome === 'win') return `客户关系 +，${quest.objective} 这步算落表了。`;
  if (outcome === 'partial')
    return `这单推进了，但 ${quest.issue.label} 会在后面追杀。${CORE_REFRAINS[1]} 姐不是走了，姐是去拉群了。`;
  return `客户冻结一天，${quest.issue.label} 进遗留。${CORE_REFRAINS[2]} 不是死档，是售后债。`;
}

function endingLine(route: RouteKey): string {
  return {
    business: '博哥把所有顺手项折成报价阶梯：免费可以聊，交付得收钱。',
    delivery: '博哥把“满意”拆成验收清单：写不出来就别急头白脸。',
    boundary: '博哥把 SLA、补材料、二开全写进表：不是不管，是别让我免费背锅。',
    shadow: 'ShadowBo 递 A/B/C 三案：客户以为自己赢了，其实每条都有价格。',
  }[route];
}

function signed(value: number): string {
  return `${value >= 0 ? '+' : ''}${Math.round(value)}`;
}

function signedMoney(value: number): string {
  return `${value >= 0 ? '+' : '-'}${money(Math.abs(value))}`;
}

function createGameTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('bo-down-0')) return;
  createTiles(scene);
  createDecor(scene);
  createBo(scene);
  createNpc(scene);
}

function createBoCutoutTextures(scene: Phaser.Scene): void {
  createCutoutTexture(scene, 'expertBoPortrait', 'expertBoCutout', {
    removeBoPetBadge: true,
  });
  createCutoutTexture(scene, 'expertBoMapPortrait', 'expertBoMapCutout', {
    removeBoPetBadge: true,
  });
  createCutoutTexture(scene, 'shadowBoPortrait', 'shadowBoCutout');
}

function createCutoutTexture(
  scene: Phaser.Scene,
  sourceKey: string,
  targetKey: string,
  options: { removeBoPetBadge?: boolean } = {},
): void {
  if (scene.textures.exists(targetKey)) return;
  const source = scene.textures
    .get(sourceKey)
    .getSourceImage() as CanvasImageSource & { width: number; height: number };
  const width = Number(source.width);
  const height = Number(source.height);
  if (!width || !height) return;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(source, 0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const seen = new Uint8Array(width * height);
  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index]) return;
    const offset = index * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    if (a < 8 || (r > 246 && g > 246 && b > 246)) {
      seen[index] = 1;
      queue.push(index);
    }
  };
  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const x = index % width;
    const y = Math.floor(index / width);
    data[index * 4 + 3] = 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
  if (options.removeBoPetBadge) {
    const cx = width * 0.76;
    const cy = height * 0.22;
    const rx = width * 0.31;
    const ry = height * 0.22;
    for (let y = 0; y < Math.min(height, height * 0.48); y += 1) {
      for (let x = Math.floor(width * 0.5); x < width; x += 1) {
        const inBadge = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1.15;
        if (inBadge) data[(y * width + x) * 4 + 3] = 0;
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  scene.textures.addCanvas(targetKey, canvas);
}

function createTiles(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const tile = (key: string, fill: number, line: number, shine: number) => {
    g.clear();
    g.fillStyle(fill).fillRect(0, 0, TILE, TILE);
    g.lineStyle(1, line, 0.45).strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
    g.fillStyle(shine, 0.38).fillRect(4, 5, 10, 2).fillRect(22, 22, 7, 2);
    g.generateTexture(key, TILE, TILE);
  };
  tile('tileOffice', 0xf2dfba, 0xc8ad78, 0xfff3cb);
  tile('tileSite', 0xd7e9ed, 0x8ab5be, 0xf1fbff);
  tile('tilePath', 0xf2c982, 0xc18a42, 0xffe5a3);
  g.destroy();
}

function createDecor(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const rects = (
    key: string,
    w: number,
    h: number,
    items: Array<[number, number, number, number, number, number?]>,
  ) => {
    g.clear();
    items.forEach(([x, y, rw, rh, color, alpha = 1]) =>
      g.fillStyle(color, alpha).fillRect(x, y, rw, rh),
    );
    g.generateTexture(`decor-${key}`, w, h);
  };
  rects('whiteboard', 96, 48, [
    [0, 0, 96, 48, 0xdff5f8],
    [5, 5, 86, 38, 0xffffff],
    [13, 15, 34, 4, 0x2c6ab3],
    [13, 26, 55, 4, 0x2a8c65],
  ]);
  rects('server', 96, 48, [
    [0, 0, 96, 48, 0x2f4158],
    [8, 8, 38, 6, 0x5dd6bb],
    [8, 24, 62, 5, 0xf8d76a],
    [78, 8, 8, 8, 0xff7a62],
    [78, 27, 8, 8, 0x5dd6bb],
  ]);
  rects('desk', 96, 48, [
    [0, 8, 96, 28, 0xb87942],
    [8, 14, 80, 6, 0xf0c479],
    [10, 36, 12, 12, 0x64432f],
    [74, 36, 12, 12, 0x64432f],
  ]);
  rects('screen', 112, 64, [
    [0, 0, 112, 54, 0x274f88],
    [8, 8, 96, 38, 0xd9fff1],
    [16, 18, 44, 4, 0x247b5f],
    [16, 30, 70, 4, 0x247b5f],
    [46, 54, 20, 10, 0x253247],
  ]);
  rects('sofa', 96, 48, [
    [0, 14, 96, 28, 0x6779b8],
    [10, 2, 30, 20, 0x8798d2],
    [56, 2, 30, 20, 0x8798d2],
    [10, 42, 10, 6, 0x333d61],
    [76, 42, 10, 6, 0x333d61],
  ]);
  rects('terminal', 80, 48, [
    [0, 8, 80, 36, 0x25374a],
    [9, 0, 62, 32, 0x1c6b70],
    [16, 8, 40, 4, 0x9df7d6],
    [16, 18, 30, 4, 0xf8d76a],
    [30, 36, 20, 12, 0x17242c],
  ]);
  g.destroy();
}

function createBo(scene: Phaser.Scene): void {
  (['down', 'left', 'right', 'up'] as Direction[]).forEach((direction) => {
    for (let frame = 0; frame < 3; frame += 1) {
      drawBoFrame(scene, direction, frame);
    }
  });
  drawBoMood(scene, 'bo-talk', 'talk');
  drawBoMood(scene, 'bo-win', 'win');
  drawBoMood(scene, 'bo-fail', 'fail');
  drawBoMood(scene, 'bo-shock', 'shock');
  drawBoMood(scene, 'bo-shadow', 'shadow');
}

function drawBoFrame(
  scene: Phaser.Scene,
  direction: Direction,
  frame: number,
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const px = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha = 1,
  ) => {
    g.fillStyle(color, alpha).fillRect(x, y, w, h);
  };
  const step = frame === 1 ? 2 : frame === 2 ? -2 : 0;
  g.clear();
  px(7, 51, 29, 5, 0x000000, 0.16);
  g.fillStyle(0xdff3ff, 0.9).fillCircle(32, 10, 6);
  g.fillStyle(0xbdddf0, 0.8).fillCircle(32, 10, 5);
  px(32, 7, 1, 6, 0x2b4050, 0.9);

  px(11, 3, 19, 5, 0x111316);
  px(8, 6, 25, 10, 0x151719);
  px(6, 12, 5, 12, 0x151719);
  px(31, 12, 5, 12, 0x151719);
  px(9, 10, 25, 20, 0xf0bf86);
  px(7, 17, 3, 7, 0xe0a86f);
  px(33, 17, 3, 7, 0xe0a86f);
  px(9, 7, 20, 5, 0x0f1113);
  px(9, 11, 15, 4, 0x0f1113);
  px(24, 9, 8, 3, 0x24272b);
  px(29, 13, 5, 5, 0x0f1113);
  px(13, 5, 6, 2, 0x2f3238);

  if (direction === 'up') {
    px(9, 12, 24, 16, 0x101214);
    px(12, 8, 15, 4, 0x25282d);
    px(28, 14, 5, 9, 0x050607);
  } else if (direction === 'left') {
    px(11, 17, 11, 6, 0xffffff);
    px(11, 16, 12, 2, 0x111111);
    px(11, 22, 12, 2, 0x111111);
    px(11, 17, 2, 6, 0x111111);
    px(21, 17, 2, 6, 0x111111);
    px(15, 19, 3, 2, 0x111111);
    px(17, 26, 7, 2, 0x9d4639);
  } else if (direction === 'right') {
    px(20, 17, 11, 6, 0xffffff);
    px(19, 16, 12, 2, 0x111111);
    px(19, 22, 12, 2, 0x111111);
    px(19, 17, 2, 6, 0x111111);
    px(29, 17, 2, 6, 0x111111);
    px(24, 19, 3, 2, 0x111111);
    px(18, 26, 7, 2, 0x9d4639);
  } else {
    px(10, 16, 10, 7, 0xffffff);
    px(22, 16, 10, 7, 0xffffff);
    px(10, 16, 10, 2, 0x101010);
    px(22, 16, 10, 2, 0x101010);
    px(10, 22, 10, 2, 0x101010);
    px(22, 22, 10, 2, 0x101010);
    px(10, 17, 2, 6, 0x101010);
    px(18, 17, 2, 6, 0x101010);
    px(22, 17, 2, 6, 0x101010);
    px(30, 17, 2, 6, 0x101010);
    px(20, 19, 2, 2, 0x101010);
    px(14, 19, 3, 2, 0x111111);
    px(25, 19, 3, 2, 0x111111);
    px(17, 26, 10, 2, 0x9d4639);
    px(19, 27, 6, 1, 0xd27762);
  }

  px(9, 31, 24, 16, 0x171d20);
  px(11, 32, 4, 12, 0x0aa6d1);
  px(28, 32, 4, 12, 0x0aa6d1);
  px(15, 33, 13, 12, 0x202a31);
  px(20, 35, 5, 2, 0x2f3e47);
  px(27, 35, 2, 2, 0x0aa6d1);
  px(6, 33, 5, 13, 0xf0bf86);
  px(32, 33, 5, 13, 0xf0bf86);
  if (direction === 'left') px(4, 34, 5, 11, 0xf0bf86);
  if (direction === 'right') px(35, 34, 5, 11, 0xf0bf86);
  px(12, 47, 9, 8 + step, 0x303337);
  px(22, 47, 9, 8 - step, 0x303337);
  px(10, 54, 12, 4, 0xffffff);
  px(22, 54, 12, 4, 0xffffff);
  px(12, 53, 8, 1, 0xc8c8c8);
  px(24, 53, 8, 1, 0xc8c8c8);
  g.generateTexture(`bo-${direction}-${frame}`, BO_FRAME_W, BO_FRAME_H);
  g.destroy();
}

function drawBoMood(
  scene: Phaser.Scene,
  key: string,
  mood: 'talk' | 'win' | 'fail' | 'shock' | 'shadow',
): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const px = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha = 1,
  ) => g.fillStyle(color, alpha).fillRect(x, y, w, h);
  g.clear();
  if (mood === 'shadow') {
    px(4, 2, 34, 54, 0x6d58d8, 0.18);
    px(1, 8, 4, 32, 0xa789ff, 0.36);
    px(37, 10, 4, 30, 0xa789ff, 0.36);
  }
  px(8, 50, 28, 6, 0x000000, 0.18);
  px(13, 3, 17, 6, mood === 'shadow' ? 0x11111f : 0x17191b);
  px(10, 10, 22, 19, mood === 'shadow' ? 0xd5a7ff : 0xf0bd82);
  px(9, 7, 25, 8, 0x17191b);
  px(8, 13, 4, 11, 0x17191b);
  px(30, 13, 4, 11, 0x17191b);
  px(12, 16, 8, 5, 0xffffff);
  px(22, 16, 8, 5, 0xffffff);
  px(12, 16, 8, 1, 0x151515);
  px(22, 16, 8, 1, 0x151515);
  px(12, 20, 8, 1, 0x151515);
  px(22, 20, 8, 1, 0x151515);
  px(12, 16, 1, 5, 0x151515);
  px(19, 16, 1, 5, 0x151515);
  px(22, 16, 1, 5, 0x151515);
  px(29, 16, 1, 5, 0x151515);
  px(20, 18, 2, 1, 0x151515);
  if (mood === 'shock') {
    px(15, 17, 2, 3, 0x111111);
    px(25, 17, 2, 3, 0x111111);
    px(19, 25, 6, 4, 0x6f2d38);
  } else if (mood === 'fail') {
    px(15, 19, 2, 1, 0x111111);
    px(25, 19, 2, 1, 0x111111);
    px(18, 26, 9, 2, 0x6f2d38);
  } else {
    px(15, 18, 2, 2, 0x111111);
    px(25, 18, 2, 2, 0x111111);
    px(
      18,
      mood === 'talk' ? 24 : 25,
      mood === 'win' ? 10 : 8,
      mood === 'talk' ? 3 : 2,
      mood === 'win' ? 0xbd513f : 0x994638,
    );
  }
  px(7, 30, 28, 17, mood === 'shadow' ? 0x241b33 : 0x1d2427);
  px(10, 31, 4, 13, 0x1aa6cf);
  px(30, 31, 4, 13, 0x1aa6cf);
  px(16, 31, 11, 13, 0x222c33);
  px(7, 32, 5, 14, mood === 'shadow' ? 0xd5a7ff : 0xf0bd82);
  px(32, 32, 5, 14, mood === 'shadow' ? 0xd5a7ff : 0xf0bd82);
  if (mood === 'win') px(3, 27, 7, 5, 0xf8d76a);
  if (mood === 'fail') px(34, 26, 5, 10, 0xff7a62);
  px(12, 47, 8, 9, 0x252b2f);
  px(24, 47, 8, 9, 0x252b2f);
  px(10, 55, 11, 3, 0xffffff);
  px(23, 55, 11, 3, 0xffffff);
  g.generateTexture(key, BO_FRAME_W, BO_FRAME_H);
  g.destroy();
}

function createNpc(scene: Phaser.Scene): void {
  for (let i = 0; i < 5; i += 1) drawNpc(scene, `npc-${i}`, false);
  drawNpc(scene, 'bossNpc', true);
}

function drawNpc(scene: Phaser.Scene, key: string, boss: boolean): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const px = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha = 1,
  ) => g.fillStyle(color, alpha).fillRect(x, y, w, h);
  g.clear();
  px(7, 49, boss ? 34 : 28, 7, 0x000000, 0.15);
  px(13, 6, boss ? 22 : 18, 8, 0x231916);
  px(11, 13, boss ? 26 : 22, 19, 0xe8b276);
  px(10, 12, boss ? 28 : 24, 7, 0x231916);
  if (boss) {
    px(8, 4, 32, 4, 0xffd66a);
    px(6, 0, 7, 7, 0xffd66a);
    px(35, 0, 7, 7, 0xffd66a);
  }
  px(13, 21, 4, 4, 0x111111);
  px(30, 21, 4, 4, 0x111111);
  px(13, 33, boss ? 24 : 22, boss ? 17 : 15, 0xffffff);
  px(10, 33, boss ? 30 : 28, boss ? 18 : 16, 0xffffff, 0.85);
  px(14, 50, 8, 8, 0x2b3034);
  px(27, 50, 8, 8, 0x2b3034);
  g.generateTexture(key, boss ? 50 : 44, 60);
  g.destroy();
}

function questById(id: string): QuestDefinition | null {
  return QUESTS.find((quest) => quest.id === id) || null;
}

function questIcon(id: string): string {
  return (
    {
      gpu: '¥',
      agent: 'AI',
      sla: 'S',
      private: '盾',
      cost: '表',
      shadow: '影',
      voicebot: '话',
      quota: '算',
      migration: '迁',
      live: '播',
      security: '安',
      invoice: '票',
      datapack: '数',
      vip: 'V',
      boss: '验',
    }[id] || '!'
  );
}

function npcTint(npcId: string): number {
  return NPCS.find((npc) => npc.id === npcId)?.tint || 0x2f6fbe;
}

function applyStatEffect(
  state: SaveState,
  event: EventDefinition | { effect: Partial<SaveState['stats']> },
): void {
  Object.entries(event.effect).forEach(([key, amount]) => {
    const stat = key as keyof SaveState['stats'];
    const max = stat === 'cash' ? 99999 : 100;
    state.stats[stat] = clamp(state.stats[stat] + (amount || 0), 0, max);
  });
}

function routeColor(route: string): number {
  return (
    {
      business: 0x9b6a22,
      delivery: 0x23715f,
      boundary: 0x315f9f,
      shadow: 0x50316f,
    }[route] || 0x264f5c
  );
}

function labelOutcome(outcome: Outcome): string {
  return { win: '谈判胜利', partial: '部分成功', fail: '谈判失败' }[outcome];
}

function pixelText(
  size: number,
  color: string,
  weight = '700',
  backgroundColor?: string,
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: `${size}px`,
    fontStyle: weight,
    color,
    backgroundColor,
    padding: backgroundColor ? { x: 5, y: 3 } : undefined,
  };
}

function addBoPhoto(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  mood: 'map' | 'talk' | 'win' | 'fail' | 'shock' | 'shadow',
  depth = 0,
): Phaser.GameObjects.Container {
  const palette = {
    map: { stroke: 0x8bd6ff, label: '原始博哥' },
    talk: { stroke: 0x4aa88d, label: '售后中' },
    win: { stroke: 0x56d79d, label: '谈成' },
    fail: { stroke: 0xff8b72, label: '受挫' },
    shock: { stroke: 0xf8d76a, label: '卡住' },
    shadow: { stroke: 0xa789ff, label: '影流' },
  }[mood];
  const container = scene.add.container(x, y).setDepth(depth);
  const aura = scene.add.ellipse(
    w / 2,
    h / 2 + 8,
    Math.max(48, w * 0.86),
    Math.max(70, h * 0.9),
    palette.stroke,
    mood === 'map' ? 0.1 : 0.16,
  );
  const shadow = scene.add.ellipse(
    w / 2,
    h - 9,
    Math.max(34, w * 0.52),
    Math.max(10, h * 0.12),
    0x000000,
    0.22,
  );
  const key =
    mood === 'shadow'
      ? 'shadowBoCutout'
      : mood === 'map'
        ? 'expertBoMapCutout'
        : 'expertBoCutout';
  const photo = scene.add.image(w / 2, h / 2 + 2, key);
  setImageFit(photo, w - 6, h - 4);
  if (mood === 'fail') photo.setTint(0xffb6a9);
  if (mood === 'shock') photo.setTint(0xffecaa);
  if (mood === 'win') photo.setTint(0xc8ffe1);
  if (mood === 'shadow') photo.setTint(0xd8c7ff);
  if (mood === 'fail' || mood === 'shock')
    photo.setAngle(mood === 'fail' ? -2 : 2);
  const chip = scene.add
    .text(
      w / 2,
      h - 2,
      palette.label,
      pixelText(
        9,
        '#fff8dc',
        '900',
        `#${palette.stroke.toString(16).padStart(6, '0')}`,
      ),
    )
    .setOrigin(0.5, 1);
  container.add([aura, shadow, photo, chip]);
  return container;
}

function setImageFit(
  image: Phaser.GameObjects.Image,
  maxW: number,
  maxH: number,
): void {
  const source = image.texture.getSourceImage() as {
    width?: number;
    height?: number;
  };
  const width = Number(source.width) || maxW;
  const height = Number(source.height) || maxH;
  const scale = Math.min(maxW / width, maxH / height);
  image.setDisplaySize(width * scale, height * scale);
}

function wrapCjkText(text: string, maxChars: number, maxLines = 3): string {
  if (text.length <= maxChars) return text;
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > maxChars && lines.length < maxLines - 1) {
    const window = remaining.slice(0, maxChars + 1);
    const breakAt = Math.max(
      window.lastIndexOf(' / '),
      window.lastIndexOf('，'),
      window.lastIndexOf('。'),
      window.lastIndexOf('；'),
      window.lastIndexOf('：'),
      window.lastIndexOf(' '),
    );
    const cut = breakAt >= Math.max(10, maxChars - 10) ? breakAt + 1 : maxChars;
    lines.push(remaining.slice(0, cut).trimEnd());
    remaining = remaining.slice(cut).trimStart();
  }
  if (lines.length < maxLines)
    lines.push(
      remaining.length > maxChars
        ? `${remaining.slice(0, maxChars - 1)}…`
        : remaining,
    );
  return lines.join('\n');
}

function makeSceneButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
  color = 0x264f5c,
  disabled = false,
  fontSize = 11,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const rect = scene.add
    .rectangle(0, 0, w, h, color, disabled ? 0.45 : 0.98)
    .setOrigin(0, 0)
    .setStrokeStyle(1, 0xffdf86, disabled ? 0.2 : 0.65);
  const text = scene.add
    .text(
      w / 2,
      h / 2,
      label,
      pixelText(fontSize, disabled ? '#b9b9b9' : '#fff8dc', '900'),
    )
    .setOrigin(0.5)
    .setAlign('center')
    .setLineSpacing(2)
    .setWordWrapWidth(w - 10);
  c.add([rect, text]);
  if (!disabled) {
    let firing = false;
    const fire = () => {
      if (firing) return;
      firing = true;
      scene.tweens.add({
        targets: c,
        scaleX: 0.97,
        scaleY: 0.97,
        yoyo: true,
        duration: 70,
      });
      onClick();
      scene.time.delayedCall(140, () => {
        firing = false;
      });
    };
    c.setSize(w, h).setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    c.on('pointerdown', fire);
    rect.setInteractive({ useHandCursor: true }).on('pointerdown', fire);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', fire);
  }
  return c;
}
