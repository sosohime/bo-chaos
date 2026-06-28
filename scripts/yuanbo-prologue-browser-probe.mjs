#!/usr/bin/env node
import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from 'playwright';

const url =
  process.env.YUANBO_URL ||
  'http://127.0.0.1:4321/retire/bo/yuanbo-game/?qa=1';
const outDir = '/tmp/yuanbo-prologue-qa';
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let browser;
try {
  browser = await chromium.launch();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("Executable doesn't exist")) throw error;
  browser = await chromium.launch({ channel: 'chrome' });
}
const failures = [];

async function runPage(name, viewport, flow) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.__YUANBO_PROLOGUE_QA__), {
    timeout: 15000,
  });
  await assertCanvasPresentation(page, name, viewport);
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  await page.screenshot({ path: `${outDir}/${name}-start.png`, fullPage: true });
  await flow(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (overflow > 2) failures.push(`${name}: horizontal overflow ${overflow}`);
  const seriousErrors = consoleErrors.filter(
    (message) => !message.includes('net::ERR_NETWORK_IO_SUSPENDED'),
  );
  if (seriousErrors.length)
    failures.push(`${name}: console/page errors\n${seriousErrors.join('\n')}`);
  await page.close();
}

async function snapshot(page) {
  return page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.snapshot());
}

async function reloadAndSnapshot(page) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.__YUANBO_PROLOGUE_QA__), {
    timeout: 15000,
  });
  await page.waitForTimeout(150);
  return snapshot(page);
}

async function assertCanvasPresentation(page, name, viewport) {
  const canvas = await page.evaluate(() => {
    const element = document.querySelector('canvas');
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      attrWidth: element.width,
      attrHeight: element.height,
    };
  });
  assert(canvas, `${name}: expected canvas`);
  if (viewport.width >= 900) {
    assert(
      canvas.width >= viewport.width * 0.9,
      `${name}: desktop canvas is too narrow (${canvas.width} in ${viewport.width}px viewport)`,
    );
    assert(
      canvas.height >= viewport.height * 0.82,
      `${name}: desktop canvas is too short (${canvas.height} in ${viewport.height}px viewport)`,
    );
    assert(
      canvas.top <= viewport.height * 0.09,
      `${name}: desktop canvas should not float like a small embedded card (top=${canvas.top})`,
    );
    assert(
      canvas.width / canvas.attrWidth <= 1.35,
      `${name}: desktop canvas is over-stretched and will blur (${canvas.width}/${canvas.attrWidth})`,
    );
  } else {
    assert(
      canvas.width >= viewport.width - 1,
      `${name}: mobile canvas should fill width (${canvas.width} in ${viewport.width}px viewport)`,
    );
    assert(
      canvas.height >= viewport.height - 1,
      `${name}: mobile canvas should fill height (${canvas.height} in ${viewport.height}px viewport)`,
    );
  }
}

async function choose(page, index = 0) {
  await page.evaluate((choiceIndex) => {
    window.__YUANBO_PROLOGUE_QA__.choose(choiceIndex);
  }, index);
  await page.waitForTimeout(100);
}

async function interactWith(
  page,
  id,
  choiceIndex = 0,
  screenshotName = '',
  options = {},
) {
  await page.evaluate((targetId) => {
    window.__YUANBO_PROLOGUE_QA__.interactWith(targetId);
  }, id);
  await page.waitForTimeout(100);
  const snap = await snapshot(page);
  if (!snap.modal?.length) failures.push(`no dialog after interacting with ${id}`);
  else {
    assert(
      snap.touchBridgeHidden,
      `${screenshotName || id}: touch controls should be hidden while a modal is open`,
    );
    if (options.expectForecast) {
      assertChoiceForecasts(
        snap,
        `${screenshotName || id} action forecasts`,
        options.forecastCount || 2,
      );
    }
    if (options.expectOpeningInboxBoard) {
      assertOpeningInboxBoard(snap, `${screenshotName || id} opening inbox board`);
    }
    if (options.expectJokeBoard) {
      assertCustomerJokeBoard(snap, `${screenshotName || id} customer joke board`);
    }
    if (options.expectCustomerReversalBoard) {
      assertCustomerReversalBoard(snap, `${screenshotName || id} customer reversal board`);
    }
    if (options.expectBossLaunchBoard) {
      assertBossLaunchBoard(snap, `${screenshotName || id} boss launch board`);
    }
    if (options.expectPrepWorkbench) {
      assertPrepWorkbench(snap, `${screenshotName || id} prep workbench`);
    }
    if (screenshotName)
      await page.screenshot({
        path: `${outDir}/${nameSafe(screenshotName)}.png`,
        fullPage: true,
      });
    await choose(page, choiceIndex);
    const afterChoice = await snapshot(page);
    if (afterChoice.modal?.length) {
      assert(
        afterChoice.touchBridgeHidden,
        `${screenshotName || id}: touch controls should stay hidden for follow-up modal`,
      );
    }
    if (options.expectResult) {
      assert(
        afterChoice.modalTitle === '现场反应',
        `${screenshotName || id}: expected scene result card, got "${afterChoice.modalTitle || ''}"`,
      );
      assertOutcomeCard(afterChoice, `${screenshotName || id} result card`);
    }
    let sawBridge = false;
    if (afterChoice.modalTitle === '镜头转场') {
      assertBridgeCard(afterChoice, `${screenshotName || id}-bridge`, afterChoice.beat);
      if (screenshotName)
        await page.screenshot({
          path: `${outDir}/${nameSafe(`${screenshotName}-bridge`)}.png`,
          fullPage: true,
        });
      await choose(page, 0);
      sawBridge = true;
    } else if (afterChoice.modalTitle === '现场反应') {
      if (screenshotName)
        await page.screenshot({
          path: `${outDir}/${nameSafe(`${screenshotName}-result`)}.png`,
          fullPage: true,
        });
      await choose(page, 0);
      sawBridge = await dismissBridgeIfPresent(page, screenshotName || id);
    } else if (afterChoice.modal?.length) {
      await choose(page, 0);
      sawBridge = await dismissBridgeIfPresent(page, screenshotName || id);
    }
    if (options.expectBridge) {
      assert(
        sawBridge,
        `${screenshotName || id}: expected story bridge after interaction`,
      );
    }
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertSceneCue(snap, name, title) {
  assert(
    snap.sceneCue?.title === title,
    `${name}: expected scene cue "${title}", got "${snap.sceneCue?.title || ''}"`,
  );
  assert(
    (snap.sceneCue?.line || '').length >= 12,
    `${name}: scene cue should include conflict line`,
  );
}

function assertSceneEvents(snap, name) {
  const events = snap.sceneEvents || [];
  assert(
    events.length >= 2,
    `${name}: expected at least two scene event bubbles, got ${events.length}`,
  );
  for (const event of events.slice(0, 2)) {
    assert(
      (event.from || '').length >= 2,
      `${name}: scene event should include a source`,
    );
    assert(
      (event.line || '').length >= 8,
      `${name}: scene event should include a readable line`,
    );
    assert(
      ['urgent', 'money', 'launch', 'customer', 'bo'].includes(event.tone || ''),
      `${name}: scene event should include a known tone`,
    );
  }
}

function assertOpeningInbox(snap, name) {
  const inbox = snap.openingInbox || [];
  assert(inbox.length === 3, `${name}: expected three opening inbox messages`);
  const senders = inbox.map((item) => item.from || '').join(' / ');
  assert(senders.includes('财务群'), `${name}: opening inbox should include finance`);
  assert(senders.includes('老板'), `${name}: opening inbox should include boss`);
  assert(senders.includes('客户语音'), `${name}: opening inbox should include customer voice`);
  for (const item of inbox) {
    assert((item.title || '').length >= 4, `${name}: inbox item should have a title`);
    assert((item.line || '').length >= 6, `${name}: inbox item should have a readable line`);
  }
  const targets = snap.openingTargets || [];
  assert(targets.length === 3, `${name}: expected three clickable opening message targets`);
  const targetIds = targets.map((item) => item.id || '').join('/');
  for (const id of ['finance', 'boss', 'customer']) {
    assert(targetIds.includes(id), `${name}: opening targets missing ${id}`);
  }
  for (const target of targets) {
    assert(
      /^opening:(finance|boss|customer)$/.test(target.decision || ''),
      `${name}: opening target should include a route decision, got "${target.decision || ''}"`,
    );
    assert(
      typeof target.x === 'number' &&
        typeof target.y === 'number' &&
        target.w >= 160 &&
        target.h >= 20,
      `${name}: opening target ${target.id || '?'} should expose clickable bounds`,
    );
    if (snap.canvas) {
      assert(
        target.x >= 0 &&
          target.x + target.w <= snap.canvas.width &&
          target.y >= 0 &&
          target.y + target.h <= snap.canvas.height,
        `${name}: opening target ${target.id || '?'} should stay inside canvas ${snap.canvas.width}x${snap.canvas.height}`,
      );
    }
  }
  assertOpeningScene(snap, name);
}

function assertOpeningScene(snap, name) {
  const scene = snap.openingScene;
  assert(scene, `${name}: expected opening desk scene`);
  assert(
    (scene.title || '').includes('工位亮屏'),
    `${name}: opening scene should be the desk screen lighting up`,
  );
  assert((scene.line || '').length >= 20, `${name}: opening scene needs readable setup`);
  const props = (scene.props || []).join('/');
  for (const marker of ['财务', '老板', '客户']) {
    assert(props.includes(marker), `${name}: opening scene missing ${marker}`);
  }
  assert(
    ['mobile-contained-incident-desk', 'desktop-incident-desk'].includes(
      scene.layout || '',
    ),
    `${name}: opening scene should declare an incident-desk layout`,
  );
}

function assertOpeningInboxBoard(snap, name) {
  assert(
    snap.modalTitle === '博哥工位：三条未读工单',
    `${name}: expected opening inbox board, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.openingInboxBoard?.boardMode === 'opening-inbox-board',
    `${name}: expected opening-inbox-board mode`,
  );
  const messages = snap.openingInboxBoard?.messages || [];
  assert(messages.length === 3, `${name}: expected three opening messages, got ${messages.length}`);
  const messageText = messages
    .map((message) => `${message.from || ''}/${message.title || ''}/${message.line || ''}`)
    .join(' / ');
  for (const marker of ['财务群', 'GPU 账单', '老板', '今天上线', '客户语音', '再梳一次']) {
    assert(messageText.includes(marker), `${name}: missing opening message marker ${marker}`);
  }
  const routes = snap.openingInboxBoard?.routes || [];
  assert(routes.length === 3, `${name}: expected three opening routes, got ${routes.length}`);
  const routeText = routes
    .map((route) => `${route.route || ''}/${route.label || ''}/${route.boLine || ''}`)
    .join(' / ');
  for (const route of ['报价', '边界', '稳住']) {
    assert(routeText.includes(route), `${name}: missing opening route ${route}`);
  }
  for (const route of routes) {
    assert((route.boLine || '').length >= 10, `${name}: route should include Bo reply line`);
    assert((route.endgame || '').length >= 10, `${name}: route should explain later impact`);
  }
  assert(
    !snap.choiceForecasts?.length,
    `${name}: opening inbox board should not be generic forecast cards`,
  );
}

function assertStoryCard(snap, name, target) {
  assert(
    /^\d{2}:\d{2}$/.test(snap.storyCard?.clock || ''),
    `${name}: story card should expose a HH:mm story clock`,
  );
  assert(
    (snap.storyCard?.place || '').length >= 4,
    `${name}: story card should expose a readable place`,
  );
  assert(
    (snap.storyCard?.act || '').length >= 6,
    `${name}: story card should expose an act label`,
  );
  assert(
    (snap.storyCard?.current || '').length >= 18,
    `${name}: story card should describe current conflict`,
  );
  assert(
    (snap.storyCard?.stakes || '').length >= 18,
    `${name}: story card should describe stakes`,
  );
  assert(
    (snap.storyCard?.next || '').length >= 12,
    `${name}: story card should describe next action`,
  );
  assert(
    (snap.storyCard?.goal || '').length >= 12,
    `${name}: story card should expose a playable goal`,
  );
  assert(
    (snap.storyCard?.win || '').length >= 12,
    `${name}: story card should expose a clear win condition`,
  );
  assert(
    (snap.storyCard?.fail || '').length >= 12,
    `${name}: story card should expose a failure consequence`,
  );
  assert(
    (snap.storyCard?.endgame || '').length >= 12,
    `${name}: story card should expose endgame impact`,
  );
  if (target) {
    assert(
      snap.storyCard?.target === target,
      `${name}: expected story target "${target}", got "${snap.storyCard?.target || ''}"`,
    );
    if (snap.mode === 'map') {
      const allowed =
        target === 'desk'
          ? ['opening-vignette']
          : ['chapter-strip', 'compact-map'];
      assert(
        allowed.includes(snap.mapHudMode || ''),
        `${name}: expected map HUD mode ${allowed.join('/')}, got "${snap.mapHudMode || ''}"`,
      );
    }
  }
  if (snap.mode === 'map') {
    assertMapStage(snap, `${name} map stage`, target);
    assertStageComposition(snap, `${name} stage composition`, target);
    assertHotspotVisuals(snap, `${name} hotspot visuals`);
  }
  assertSceneEvents(snap, `${name} scene events`);
  if (target && !['battle', 'ending'].includes(target)) {
    assertTargetGuide(snap, `${name} target guide`, target);
  }
  if (target && !['desk', 'battle', 'ending'].includes(target)) {
    assertActorBarks(snap, `${name} actor barks`);
  }
  if (snap.mode === 'map' && target && !['desk', 'battle', 'ending'].includes(target)) {
    assertStorySetPiece(snap, `${name} story set piece`);
    assertSceneMemoryProps(snap, `${name} scene memory`);
  }
  assertBoThought(snap, `${name} bo thought`);
  assertCausalChain(snap, `${name} causal chain`, target === 'ending');
}

function assertMapStage(snap, name, target) {
  const stage = snap.mapStage;
  assert(stage, `${name}: expected a map stage snapshot`);
  assert(
    ['opening-pressure-stage', 'focused-act-stage'].includes(stage.mode || ''),
    `${name}: unexpected map stage mode "${stage.mode || ''}"`,
  );
  assert(
    (stage.sceneTitle || '').length >= 4,
    `${name}: map stage should include a readable scene title`,
  );
  if (target === 'desk') {
    assert(
      stage.mode === 'opening-pressure-stage',
      `${name}: opening should render as pressure-stage, got "${stage.mode || ''}"`,
    );
    assert(
      stage.activeZone === 'desk',
      `${name}: opening active zone should be desk, got "${stage.activeZone || ''}"`,
    );
    return;
  }
  if (!target || ['battle', 'ending'].includes(target)) return;
  assert(
    stage.mode === 'focused-act-stage',
    `${name}: story map should render as focused act stage, got "${stage.mode || ''}"`,
  );
  assert(
    Array.isArray(stage.visibleZones) && stage.visibleZones.length <= 2,
    `${name}: map should not show a cluttered all-zone layout, got ${(stage.visibleZones || []).join('/')}`,
  );
  assert(
    (stage.visibleZones || []).includes(stage.activeZone),
    `${name}: visible zones should include active zone`,
  );
}

function assertStageComposition(snap, name, target) {
  const composition = snap.stageComposition;
  assert(composition, `${name}: expected stage composition`);
  for (const key of ['title', 'antagonist', 'conflict', 'evidence', 'playerTask', 'next']) {
    assert(
      (composition?.[key] || '').length >= (key === 'antagonist' ? 2 : 8),
      `${name}: stage composition missing readable ${key}`,
    );
    assert(
      !/(TODO|debug|placeholder|素材|系统摆件)/i.test(composition?.[key] || ''),
      `${name}: stage composition ${key} should not include placeholder copy`,
    );
  }
  assert(
    ['money', 'launch', 'customer', 'briefing'].includes(composition?.tone || ''),
    `${name}: stage composition should expose known tone, got "${composition?.tone || ''}"`,
  );
  const expectedAntagonist =
    target === 'finance'
      ? '财务姐'
      : target === 'boss'
        ? '老板'
        : target === 'customer'
          ? '客户姐'
          : '';
  if (expectedAntagonist) {
    assert(
      (composition?.antagonist || '').includes(expectedAntagonist),
      `${name}: expected stage antagonist ${expectedAntagonist}, got "${composition?.antagonist || ''}"`,
    );
  }
  if (['boss', 'customer'].includes(target || '')) {
    assert(
      Array.isArray(composition?.residue) && composition.residue.length >= 1,
      `${name}: later scenes should visibly carry residue from previous acts`,
    );
  }
}

function assertHotspotVisuals(snap, name) {
  const visuals = snap.hotspotVisuals || [];
  assert(Array.isArray(visuals), `${name}: expected hotspot visual snapshot array`);
  for (const visual of visuals) {
    assert(
      visual.marker !== '已读',
      `${name}: read clue should not render an editor-like 已读 badge`,
    );
    if (visual.kind === 'clue' && visual.readClue) {
      assert(
        visual.outline === 'hidden-clue-zone' && !visual.marker,
        `${name}: read clue ${visual.id} should blend into scene without marker`,
      );
    }
    if (visual.kind === 'clue' && !visual.readClue && visual.marker) {
      assert(
        visual.marker === '资料',
        `${name}: unread clue ${visual.id} should use a small 资料 marker`,
      );
    }
  }
}

function assertStorySetPiece(snap, name) {
  const setPiece = snap.storySetPiece;
  assert(setPiece, `${name}: expected a focused story set piece`);
  assert(
    (setPiece?.title || '').length >= 5,
    `${name}: set piece should include a scene title`,
  );
  assert(
    (setPiece?.subtitle || '').length >= 18,
    `${name}: set piece should include a readable scene subtitle`,
  );
  assert(
    Array.isArray(setPiece?.props) && setPiece.props.length >= 3,
    `${name}: set piece should expose at least three story props`,
  );
  assert(
    ['money', 'launch', 'customer', 'briefing'].includes(setPiece?.tone || ''),
    `${name}: set piece should include a known tone`,
  );
}

function assertSceneMemoryProps(snap, name) {
  const memory = snap.sceneMemoryProps || [];
  const labels = memory.map((item) => item.label || '').join('/');
  const expect = [];
  if (['boss', 'bossRehearsal', 'customer', 'customerReversal'].includes(snap.beat)) {
    expect.push('上午账单');
  }
  if (['customer', 'customerReversal'].includes(snap.beat)) {
    expect.push('上线说法');
  }
  if (snap.beat === 'customerReversal') {
    expect.push('客户边界');
  }
  for (const label of expect) {
    assert(labels.includes(label), `${name}: scene memory should carry ${label}`);
  }
  for (const item of memory) {
    assert((item.line || '').length >= 6, `${name}: scene memory line should be readable`);
    assert(
      !/(TODO|debug|placeholder|素材)/i.test(item.line || ''),
      `${name}: scene memory should not include placeholder copy`,
    );
  }
}

function assertBoThought(snap, name) {
  const thought = snap.boThought || '';
  assert(thought.length >= 6, `${name}: expected readable Bo inner thought`);
  assert(
    !/(TODO|debug|placeholder|素材|系统摆件)/i.test(thought),
    `${name}: Bo thought should not include placeholder copy`,
  );
  if (snap.mode === 'map' && (snap.canvas?.width || 0) >= 720) {
    assert(snap.boThoughtBox, `${name}: desktop map should render Bo thought bubble`);
    assert(
      snap.boThoughtBox?.x >= 90 && snap.boThoughtBox?.x <= 870,
      `${name}: Bo thought bubble x should stay inside map, got ${snap.boThoughtBox?.x}`,
    );
    assert(
      snap.boThoughtBox?.y >= 120 && snap.boThoughtBox?.y <= 560,
      `${name}: Bo thought bubble y should stay inside map, got ${snap.boThoughtBox?.y}`,
    );
  }
}

function assertActorBarks(snap, name) {
  const barks = snap.actorBarks || [];
  assert(barks.length >= 1, `${name}: expected an active actor bark`);
  for (const bark of barks.slice(0, 2)) {
    assert((bark.name || '').length >= 2, `${name}: actor bark should include name`);
    assert((bark.line || '').length >= 6, `${name}: actor bark should include a readable line`);
    assert(
      !/(TODO|debug|placeholder|素材)/i.test(bark.line || ''),
      `${name}: actor bark should not include placeholder copy`,
    );
  }
}

function assertCausalChain(snap, name, expectEnding = false) {
  const chain = snap.causalChain || [];
  assert(chain.length === 5, `${name}: expected five cause-effect beats, got ${chain.length}`);
  const line = snap.causalLine || chain.join(' -> ');
  for (const marker of ['开场', '钱', '上线', '客户']) {
    assert(
      chain.some((item) => (item || '').includes(marker)),
      `${name}: missing ${marker} in cause-effect chain`,
    );
  }
  assert(
    line.includes('->') || chain.length > 1,
    `${name}: causal line should read as a connected story`,
  );
  if (expectEnding) {
    assert(
      chain.some((item) => (item || '').startsWith('结局：')),
      `${name}: ending should include final route result in cause-effect chain`,
    );
  }
}

function assertTargetGuide(snap, name, target) {
  const guide = snap.targetGuide;
  assert(guide, `${name}: expected target guide`);
  assert(
    (guide?.label || '').length >= 2,
    `${name}: target guide should include a label`,
  );
  assert(
    (guide?.action || '').length >= 4,
    `${name}: target guide should include an action`,
  );
  assert(
    typeof guide?.distance === 'number' && guide.distance >= 0,
    `${name}: target guide should include non-negative distance`,
  );
  assert(
    ['•', '→', '←', '↓', '↑', '↓→', '↓←', '↑→', '↑←'].includes(guide?.arrow || ''),
    `${name}: target guide should include a direction arrow, got "${guide?.arrow || ''}"`,
  );
  if (target === 'desk') {
    assert(guide?.id === 'desk', `${name}: expected desk guide, got ${guide?.id || ''}`);
  }
}

async function assertCanvasClickWalk(page, name) {
  const before = await snapshot(page);
  const point = await page.evaluate(() => {
    const rect = document.querySelector('canvas').getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.72,
      y: rect.top + rect.height * 0.54,
    };
  });
  await page.mouse.click(point.x, point.y);
  await page.waitForFunction(
    (start) => {
      const snap = window.__YUANBO_PROLOGUE_QA__.snapshot();
      return (
        snap.mode === 'map' &&
        !snap.modalTitle &&
        Math.hypot(snap.player.x - start.x, snap.player.y - start.y) > 20
      );
    },
    before.player,
    { timeout: 3000 },
  );
  const after = await snapshot(page);
  assert(
    Math.hypot(after.player.x - before.player.x, after.player.y - before.player.y) > 20,
    `${name}: canvas click should move Bo across the map`,
  );
  assert(!after.modalTitle, `${name}: canvas click-walk should not open a modal`);
}

async function screenPointForWorld(page, world) {
  return page.evaluate(({ x, y }) => {
    const rect = document.querySelector('canvas').getBoundingClientRect();
    const snap = window.__YUANBO_PROLOGUE_QA__.snapshot();
    return {
      x: rect.left + ((x - snap.camera.scrollX) / snap.canvas.width) * rect.width,
      y: rect.top + ((y - snap.camera.scrollY) / snap.canvas.height) * rect.height,
    };
  }, world);
}

async function assertClickTargetApproach(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  const farPoint = await page.evaluate(() => {
    const rect = document.querySelector('canvas').getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.88,
      y: rect.top + rect.height * 0.68,
    };
  });
  await page.mouse.click(farPoint.x, farPoint.y);
  await page.waitForFunction(
    () => {
      const snap = window.__YUANBO_PROLOGUE_QA__.snapshot();
      return snap.mode === 'map' && !snap.modalTitle && snap.targetGuide?.distance >= 20;
    },
    null,
    { timeout: 5000 },
  );
  const beforeTargetClick = await snapshot(page);
  assert(
    beforeTargetClick.targetGuide?.id === 'desk',
    `${name}: expected desk guide before target click`,
  );
  const targetPoint = await screenPointForWorld(page, beforeTargetClick.targetGuide);
  await page.mouse.click(targetPoint.x, targetPoint.y);
  await page.waitForFunction(
    () => {
      const snap = window.__YUANBO_PROLOGUE_QA__.snapshot();
      return (
        snap.mode === 'map' &&
        !snap.modalTitle &&
        snap.clickMoveActive &&
        snap.pendingInteraction?.id === 'desk'
      );
    },
    null,
    { timeout: 3000 },
  );
  await page.waitForFunction(
    () => {
      const snap = window.__YUANBO_PROLOGUE_QA__.snapshot();
      return snap.modalTitle === '博哥工位：三条未读工单';
    },
    null,
    { timeout: 6000 },
  );
  const after = await snapshot(page);
  assert(
    after.modalTitle === '博哥工位：三条未读工单',
    `${name}: clicking a far target should walk Bo over and then open the target dialog`,
  );
  assertOpeningInboxBoard(after, `${name} click-target opening inbox board`);
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
}

async function assertOpeningMessageClick(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  let snap = await snapshot(page);
  assertOpeningInbox(snap, `${name} direct opening click setup`);
  const target = (snap.openingTargets || []).find((item) => item.id === 'boss');
  assert(target, `${name}: expected clickable boss opening target`);
  const point = await screenPointForWorld(page, {
    x: target.x + target.w / 2,
    y: target.y + target.h / 2,
  });
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(140);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '现场反应',
    `${name}: clicking opening message should show outcome card, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.decisions?.includes('opening:boss'),
    `${name}: clicking boss message should record opening:boss`,
  );
  assertOutcomeCard(snap, `${name} direct opening message outcome`);
  await page.screenshot({
    path: `${outDir}/${nameSafe(`${name}-opening-message-result`)}.png`,
    fullPage: true,
  });
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
}

async function assertNoMaterialBattleGate(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  await interactWith(page, 'desk', 0, `${name}-desk-fast`, {
    expectResult: true,
    expectBridge: true,
    expectOpeningInboxBoard: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-fast`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  await interactWith(page, 'finance', 2, `${name}-finance-audit-fast`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  await interactWith(page, 'boss', 2, `${name}-boss-fast`, {
    expectResult: true,
    expectBridge: true,
    expectBossLaunchBoard: true,
  });
  await interactWith(page, 'boss', 2, `${name}-boss-rehearsal-fast`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  await interactWith(page, 'customer', 1, `${name}-customer-fast`, {
    expectResult: true,
    expectBridge: true,
    expectJokeBoard: true,
  });
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.interactWith('customer'));
  await page.waitForTimeout(100);
  let snap = await snapshot(page);
  assertCustomerReversalBoard(snap, `${name} customer reversal board before battle gate`);
  await choose(page, 1);
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '上桌前还缺东西',
    `${name}: expected no-material battle gate, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.mode === 'map' && snap.beat === 'customerReversal',
    `${name}: no-material gate should keep player on customer reversal map`,
  );
  assert(
    snap.battleReadiness?.ready === false,
    `${name}: no-material route should not be battle ready`,
  );
  assert(
    snap.targetGuide?.id === 'briefing',
    `${name}: no-material gate should guide player to briefing, got "${snap.targetGuide?.id || ''}"`,
  );
  await page.screenshot({
    path: `${outDir}/${nameSafe(`${name}-no-material-gate`)}.png`,
    fullPage: true,
  });
  await choose(page, 0);
  await page.waitForTimeout(80);
  snap = await snapshot(page);
  assert(
    snap.mode === 'map' && snap.beat === 'customerReversal',
    `${name}: closing battle gate should return to map, got ${snap.mode}/${snap.beat}`,
  );
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
}

async function completeLedgerSorting(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.interactWith('ledger'));
  await page.waitForTimeout(100);
  let snap = await snapshot(page);
  assert(
    snap.modalTitle === '账单拆包：把截图贴到正确格子',
    `${name}: expected ledger sorting board, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.ledgerSorting?.complete === false &&
      (snap.ledgerSorting?.remaining || []).length === 3,
    `${name}: ledger sorting should start with three remaining items`,
  );
  assertLedgerSortingBoard(snap, `${name} ledger sorting board`, 0);
  await page.screenshot({
    path: `${outDir}/${nameSafe(`${name}-ledger-sort-start`)}.png`,
    fullPage: true,
  });
  for (const [index, expected] of ['gpu', 'trial', 'free'].entries()) {
    snap = await snapshot(page);
    assert(
      (snap.ledgerSorting?.remaining || []).some((item) => item.id === expected),
      `${name}: ledger sorting should still include ${expected}`,
    );
    assertLedgerSortingBoard(snap, `${name} ledger sorting board step ${index + 1}`, index);
    await choose(page, 0);
    await page.waitForTimeout(100);
  }
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '现场反应',
    `${name}: completing ledger sorting should show outcome card, got "${snap.modalTitle || ''}"`,
  );
  assertOutcomeCard(snap, `${name} ledger sorting outcome`);
  assert(
    snap.ledgerSorting?.complete === true,
    `${name}: ledger sorting should be complete after three placements`,
  );
  assert(
    snap.clues?.includes('成本三列表') && snap.clues?.includes('GPU 峰值曲线'),
    `${name}: ledger sorting should add core bill evidence`,
  );
  await page.screenshot({
    path: `${outDir}/${nameSafe(`${name}-ledger-sort-result`)}.png`,
    fullPage: true,
  });
  await choose(page, 0);
  await page.waitForTimeout(100);
}

function assertLedgerSortingBoard(snap, name, placedCount) {
  assert(
    snap.ledgerSorting?.boardMode === 'ticket-slot-board',
    `${name}: expected ticket-slot-board mode, got "${snap.ledgerSorting?.boardMode || ''}"`,
  );
  const slots = snap.ledgerSorting?.slots || [];
  assert(slots.length === 3, `${name}: expected three ledger slots, got ${slots.length}`);
  const targets = slots.map((slot) => slot.target || '').join('/');
  for (const target of ['加急服务包', '基础服务包', '免费额度线']) {
    assert(targets.includes(target), `${name}: ledger slot missing ${target}`);
  }
  const placed = slots.filter((slot) => slot.placed).length;
  assert(
    placed === placedCount,
    `${name}: expected ${placedCount} placed ledger tickets, got ${placed}`,
  );
  const remaining = snap.ledgerSorting?.remaining || [];
  assert(
    remaining.length === 3 - placedCount,
    `${name}: expected ${3 - placedCount} remaining ledger tickets, got ${remaining.length}`,
  );
  assert(
    !snap.choiceForecasts?.length,
    `${name}: ledger sorting should be a board, not generic forecast buttons`,
  );
}

function assertCustomerJokeBoard(snap, name) {
  assert(
    snap.modalTitle === '客户语音拆句：报价、补偿、拉倒',
    `${name}: expected customer joke board, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.customerJokeBoard?.boardMode === 'voice-fragment-board',
    `${name}: expected voice-fragment-board mode`,
  );
  const fragments = snap.customerJokeBoard?.fragments || [];
  assert(fragments.length === 3, `${name}: expected three joke fragments, got ${fragments.length}`);
  const quotes = fragments.map((fragment) => fragment.quote || '').join(' / ');
  for (const quote of ['这姐咋收钱啊', '再给你梳一次', '不行拉倒']) {
    assert(quotes.includes(quote), `${name}: missing joke fragment ${quote}`);
  }
  const lanes = fragments.map((fragment) => fragment.lane || '').join('/');
  for (const lane of ['报价', '补一次', '拉倒']) {
    assert(lanes.includes(lane), `${name}: missing joke lane ${lane}`);
  }
  for (const fragment of fragments) {
    assert((fragment.pressure || '').length >= 12, `${name}: fragment should explain pressure`);
  }
  const routes = snap.customerJokeBoard?.routes || [];
  assert(routes.length === 3, `${name}: expected three response routes, got ${routes.length}`);
  const routeLabels = routes.map((route) => route.route || '').join('/');
  for (const route of ['报价', '补偿', '拉倒']) {
    assert(routeLabels.includes(route), `${name}: missing response route ${route}`);
  }
  for (const route of routes) {
    assert((route.boLine || '').length >= 10, `${name}: route should include Bo line`);
    assert((route.endgame || '').length >= 10, `${name}: route should explain final-table impact`);
  }
  assert(
    !snap.choiceForecasts?.length,
    `${name}: customer joke board should not be generic forecast cards`,
  );
}

function assertCustomerReversalBoard(snap, name) {
  assert(
    snap.modalTitle === '客户反悔拆板：免费、上线、拉倒',
    `${name}: expected customer reversal board, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.customerReversalBoard?.boardMode === 'reversal-pressure-board',
    `${name}: expected reversal-pressure-board mode`,
  );
  const pressures = snap.customerReversalBoard?.pressures || [];
  assert(pressures.length === 3, `${name}: expected three reversal pressures, got ${pressures.length}`);
  const pressureText = pressures
    .map((pressure) => `${pressure.label || ''}/${pressure.quote || ''}/${pressure.lane || ''}`)
    .join(' / ');
  for (const marker of ['再给我梳一次', '今天顺手全部上线', '不行就拉倒']) {
    assert(pressureText.includes(marker), `${name}: missing reversal pressure ${marker}`);
  }
  for (const lane of ['补一次要写小', '范围先拆开', '拉倒留台阶']) {
    assert(pressureText.includes(lane), `${name}: missing reversal lane ${lane}`);
  }
  for (const pressure of pressures) {
    assert((pressure.pressure || '').length >= 12, `${name}: pressure should explain risk`);
  }
  const routes = snap.customerReversalBoard?.routes || [];
  assert(routes.length === 3, `${name}: expected three reversal routes, got ${routes.length}`);
  const routeLabels = routes.map((route) => route.route || '').join('/');
  for (const route of ['报价', '补偿', '拉倒']) {
    assert(routeLabels.includes(route), `${name}: missing reversal response route ${route}`);
  }
  for (const route of routes) {
    assert((route.boLine || '').length >= 10, `${name}: route should include Bo line`);
    assert((route.endgame || '').length >= 10, `${name}: route should explain final-table impact`);
  }
  assert(
    !snap.choiceForecasts?.length,
    `${name}: customer reversal board should not be generic forecast cards`,
  );
}

function assertBossLaunchBoard(snap, name) {
  assert(
    snap.modalTitle === '老板上线拆板：今天上线怎么说',
    `${name}: expected boss launch board, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.bossLaunchBoard?.boardMode === 'launch-pressure-board',
    `${name}: expected launch-pressure-board mode`,
  );
  const pressures = snap.bossLaunchBoard?.pressures || [];
  assert(pressures.length === 3, `${name}: expected three launch pressures, got ${pressures.length}`);
  const pressureText = pressures
    .map((pressure) => `${pressure.label || ''}/${pressure.quote || ''}/${pressure.lane || ''}`)
    .join(' / ');
  for (const marker of ['客户下午来', 'Agent 今天上线', '话要能播']) {
    assert(pressureText.includes(marker), `${name}: missing launch pressure ${marker}`);
  }
  for (const lane of ['先定验收', '缩成试点', '别说太满']) {
    assert(pressureText.includes(lane), `${name}: missing launch lane ${lane}`);
  }
  for (const pressure of pressures) {
    assert((pressure.pressure || '').length >= 12, `${name}: pressure should explain risk`);
  }
  const routes = snap.bossLaunchBoard?.routes || [];
  assert(routes.length === 3, `${name}: expected three launch response routes, got ${routes.length}`);
  const routeLabels = routes.map((route) => route.route || '').join('/');
  for (const route of ['边界', '稳住', '冒险']) {
    assert(routeLabels.includes(route), `${name}: missing boss response route ${route}`);
  }
  for (const route of routes) {
    assert((route.boLine || '').length >= 10, `${name}: route should include Bo line`);
    assert((route.endgame || '').length >= 10, `${name}: route should explain final-table impact`);
  }
  assert(
    !snap.choiceForecasts?.length,
    `${name}: boss launch board should not be generic forecast cards`,
  );
}

function assertPrepWorkbench(snap, name) {
  assert(
    snap.modalTitle === '战前准备桌：台词彩排工作台',
    `${name}: expected prep workbench, got "${snap.modalTitle || ''}"`,
  );
  assert(
    snap.prepWorkbench?.boardMode === 'rehearsal-workbench',
    `${name}: expected rehearsal-workbench mode`,
  );
  assert(
    typeof snap.prepWorkbench?.timeLeft === 'number' && snap.prepWorkbench.timeLeft > 0,
    `${name}: prep workbench should expose remaining action time`,
  );
  const cards = (snap.prepWorkbench?.cards || []).filter((card) => !card.prepared);
  assert(cards.length >= 1, `${name}: expected at least one available prep card`);
  const labels = cards.map((card) => card.label || '').join(' / ');
  assert(
    /演练收费说法|小范围试点|拉倒台阶/.test(labels),
    `${name}: expected authored prep labels, got "${labels}"`,
  );
  const routes = cards.map((card) => card.route || '').join('/');
  assert(
    ['报价', '补偿', '拉倒'].some((route) => routes.includes(route)),
    `${name}: prep workbench should expose route tags, got "${routes}"`,
  );
  for (const card of cards) {
    assert((card.line || '').length >= 16, `${name}: prep card should include rehearsal line`);
    assert((card.gain || '').length >= 8, `${name}: prep card should include gain text`);
    assert((card.risk || '').length >= 8, `${name}: prep card should include risk text`);
  }
  assert(
    !snap.choiceForecasts?.length,
    `${name}: prep workbench should not be generic forecast cards`,
  );
}

function assertChoiceForecasts(snap, name, minCount = 2) {
  const forecasts = snap.choiceForecasts || [];
  assert(
    forecasts.length >= minCount,
    `${name}: expected at least ${minCount} action forecast cards, got ${forecasts.length}`,
  );
  const requiresManagementHint =
    /资料|准备/.test(snap.modalTitle || '') ||
    forecasts.some((forecast) => forecast.cost === '1行动');
  if (requiresManagementHint) {
    assert(snap.managementHint, `${name}: expected a management hint beside management cards`);
    assert(
      /行动\s+\d+\/\d+/.test(snap.managementHint?.ledger || ''),
      `${name}: management hint should expose remaining action budget`,
    );
    assert(
      (snap.managementHint?.gap || '').length >= 8,
      `${name}: management hint should explain the current strategic gap`,
    );
    assert(
      (snap.managementHint?.recommendation || '').length >= 10,
      `${name}: management hint should recommend a readable next move`,
    );
    assert(
      (snap.managementHint?.finalUse || '').length >= 8,
      `${name}: management hint should explain what enters the final table`,
    );
  } else {
    assert(
      !snap.managementHint,
      `${name}: pure story choices should not show the management ledger`,
    );
  }
  for (const forecast of forecasts.slice(0, minCount)) {
    assert(
      ['报价', '补偿', '边界', '拉倒', '稳住', '冒险'].includes(forecast.route || ''),
      `${name}: forecast should include a route, got "${forecast.route || ''}"`,
    );
    assert(
      /行动/.test(forecast.cost || ''),
      `${name}: forecast should include an action cost, got "${forecast.cost || ''}"`,
    );
    assert(
      (forecast.recommendation || '').length >= 8,
      `${name}: forecast should include a management recommendation`,
    );
    assert(
      (forecast.speech || '').length >= 8,
      `${name}: forecast should include a playable Bo speech line`,
    );
    assert(
      !/(当场会怎样|可能埋下|晚上用得上)/.test(forecast.speech || ''),
      `${name}: speech line should not be old system forecast copy`,
    );
    assert(
      (forecast.gain || '').length >= 8,
      `${name}: forecast should include gain text`,
    );
    assert(
      (forecast.risk || '').length >= 8,
      `${name}: forecast should include risk text`,
    );
    assert(
      (forecast.endgame || '').length >= 8,
      `${name}: forecast should include endgame impact text`,
    );
  }
}

function assertOutcomeCard(snap, name) {
  assert(snap.outcomeCard, `${name}: expected structured outcome card`);
  assert(
    (snap.outcomeCard?.title || '').length >= 4,
    `${name}: outcome card should include a result title`,
  );
  assert(
    (snap.outcomeCard?.sceneChange || '').length >= 8,
    `${name}: outcome card should include scene change`,
  );
  assert(
    (snap.outcomeCard?.finalImpact || '').length >= 10,
    `${name}: outcome card should include final negotiation impact`,
  );
  assert(
    (snap.outcomeCard?.nextAction || '').length >= 8,
    `${name}: outcome card should include next action`,
  );
  assert(
    Array.isArray(snap.outcomeCard?.chips) && snap.outcomeCard.chips.length >= 1,
    `${name}: outcome card should include at least one change chip`,
  );
}

function assertBridgeCard(snap, name, targetBeat) {
  assert(
    snap.modalTitle === '镜头转场',
    `${name}: expected bridge modal, got "${snap.modalTitle || ''}"`,
  );
  assert(
    (snap.bridgeCard?.title || '').length >= 8,
    `${name}: bridge should include a title`,
  );
  assert(
    (snap.bridgeCard?.sceneLine || '').length >= 18,
    `${name}: bridge should include a scene line`,
  );
  assert(
    (snap.bridgeCard?.boLine || '').length >= 12,
    `${name}: bridge should include Bo inner line`,
  );
  assert(
    (snap.bridgeCard?.nextAction || '').length >= 10,
    `${name}: bridge should include next action`,
  );
  const storyboard = snap.bridgeCard?.storyboard || [];
  assert(storyboard.length === 3, `${name}: bridge should render three storyboard panels`);
  for (const panel of storyboard) {
    assert(
      (panel.label || '').length >= 4,
      `${name}: storyboard panel should include a readable label`,
    );
    assert(
      (panel.line || '').length >= 12,
      `${name}: storyboard panel should include a readable story line`,
    );
  }
  if (targetBeat) {
    assert(
      snap.bridgeCard?.nextBeat === targetBeat,
      `${name}: expected bridge target "${targetBeat}", got "${snap.bridgeCard?.nextBeat || ''}"`,
    );
  }
  if (targetBeat === 'battle') {
    assertBattleDossier(snap, `${name} battle dossier`);
  }
}

function assertBattleDossier(snap, name) {
  const dossier = snap.bridgeCard?.battleDossier || [];
  assert(dossier.length >= 4, `${name}: expected four battle dossier lines`);
  const text = dossier.join(' / ');
  for (const marker of ['财务', '老板', '客户', '资料']) {
    assert(text.includes(marker), `${name}: missing ${marker} in battle dossier`);
  }
}

function assertPhaseBreakCard(snap, name) {
  assert(snap.phaseBreakCard, `${name}: expected structured phase break card`);
  assert(
    (snap.phaseBreakCard?.completedTitle || '').length >= 4,
    `${name}: phase break should include completed stage title`,
  );
  assert(
    (snap.phaseBreakCard?.story || '').length >= 18,
    `${name}: phase break should tell what changed in the story`,
  );
  assert(
    (snap.phaseBreakCard?.nextTitle || '').length >= 4,
    `${name}: phase break should include next stage title`,
  );
  assert(
    (snap.phaseBreakCard?.nextGoal || '').length >= 18,
    `${name}: phase break should describe next play goal in plain language`,
  );
  assert(
    (snap.phaseBreakCard?.nextPressure || '').length >= 8,
    `${name}: phase break should include the upgraded customer pressure`,
  );
  const panels = snap.phaseBreakCard?.panels || [];
  assert(panels.length === 3, `${name}: phase break should render three story panels`);
  for (const panel of panels) {
    assert((panel.label || '').length >= 3, `${name}: phase panel should include label`);
    assert((panel.line || '').length >= 12, `${name}: phase panel should include story line`);
  }
  assert(
    Array.isArray(snap.phaseBreakCard?.chips) && snap.phaseBreakCard.chips.length >= 4,
    `${name}: phase break should expose compact state chips`,
  );
  const visibleText = [
    snap.phaseBreakCard?.story || '',
    snap.phaseBreakCard?.nextGoal || '',
    snap.phaseBreakCard?.nextPressure || '',
    panels.map((panel) => panel.line || '').join(' '),
  ].join(' ');
  assert(
    !/[<>]=?/.test(visibleText),
    `${name}: phase break should not expose numeric formula copy`,
  );
  assert(
    !/当前局面/.test(visibleText),
    `${name}: phase break should not read like a status report`,
  );
}

async function dismissBridgeIfPresent(page, name) {
  const snap = await snapshot(page);
  if (snap.modalTitle !== '镜头转场') return false;
  assertBridgeCard(snap, `${name}-bridge`, snap.beat);
  await page.screenshot({
    path: `${outDir}/${nameSafe(`${name}-bridge`)}.png`,
    fullPage: true,
  });
  await choose(page, 0);
  return true;
}

function assertDebts(snap, name, expected) {
  for (const debt of expected) {
    assert(
      snap.debts?.includes(debt),
      `${name}: expected debt "${debt}", got "${(snap.debts || []).join(',')}"`,
    );
  }
}

function assertPrep(snap, name, expected) {
  for (const prep of expected) {
    assert(
      snap.preps?.includes(prep),
      `${name}: expected prep "${prep}", got "${(snap.preps || []).join(',')}"`,
    );
  }
}

function assertMilestones(snap, name, expected) {
  for (const milestone of expected) {
    assert(
      snap.milestones?.includes(milestone),
      `${name}: expected milestone "${milestone}", got "${(snap.milestones || []).join(',')}"`,
    );
  }
}

function assertBattleReadable(snap, name) {
  assert(
    snap.battle?.sceneMode === 'meeting-table',
    `${name}: battle should render as meeting-table scene`,
  );
  assert(
    ['price', 'scope', 'anger'].includes(snap.battle?.intentType || ''),
    `${name}: battle should expose a typed customer intent`,
  );
  assertStoryPressure(snap, `${name} story pressure`);
  assertBattleTurnBeat(snap, `${name} turn beat`);
  assertBattleDuelFocus(snap, `${name} duel focus`);
  assertBattleClosingGoals(snap, `${name} closing goals`);
  assertNegotiationTable(snap, `${name} negotiation table`);
  assert(
    (snap.battle?.suggestedSkills || []).length >= 1,
    `${name}: battle should suggest counter skills`,
  );
  assertBattleCommands(snap, `${name} battle commands`);
  const previews = snap.battle?.skillPreviews || {};
  for (const id of ['quote', 'compensate', 'boundary', 'walkaway', 'breathe']) {
    assert(
      (previews[id]?.effect || '').length >= 8,
      `${name}: missing skill preview effect for ${id}`,
    );
    assert(
      (previews[id]?.reason || '').length >= 8,
      `${name}: missing skill preview reason for ${id}`,
    );
  }
}

function assertBattleDuelFocus(snap, name) {
  const focus = snap.battle?.duelFocus;
  assert(focus, `${name}: battle should expose a duel focus`);
  assert((focus?.title || '').length >= 4, `${name}: duel focus needs a title`);
  assert(
    (focus?.customerLine || '').length >= 10,
    `${name}: duel focus needs the current customer line`,
  );
  assert(
    (focus?.boHint || '').length >= 10,
    `${name}: duel focus needs Bo's immediate reply hint`,
  );
  assert(
    (focus?.tableLine || '').length >= 10,
    `${name}: duel focus needs table consequence copy`,
  );
  assert(
    Array.isArray(focus?.recommended) && focus.recommended.length >= 1,
    `${name}: duel focus should expose recommended skills`,
  );
}

function assertBattleClosingGoals(snap, name) {
  const goals = snap.battle?.closingGoals || [];
  assert(goals.length === 3, `${name}: expected three closing goals, got ${goals.length}`);
  const labels = goals.map((goal) => goal.label || '').join('/');
  for (const label of ['收钱', '补一次', '体面拉倒']) {
    assert(labels.includes(label), `${name}: missing closing goal ${label}`);
  }
  for (const goal of goals) {
    assert((goal.status || '').length >= 2, `${name}: closing goal should include status`);
    assert((goal.line || '').length >= 8, `${name}: closing goal should explain the next need`);
    assert(
      typeof goal.progress === 'number' && goal.progress >= 0 && goal.progress <= 1,
      `${name}: closing goal progress should stay in 0..1`,
    );
    assert(
      typeof goal.done === 'boolean',
      `${name}: closing goal should expose done boolean`,
    );
  }
}

function assertBattleCommands(snap, name) {
  const commands = snap.battle?.skillCommands || [];
  assert(commands.length === 5, `${name}: expected five battle command cards, got ${commands.length}`);
  assert(
    commands.some((command) => command.countered),
    `${name}: at least one battle command should counter the current customer pressure`,
  );
  for (const command of commands) {
    assert((command.label || '').length >= 2, `${name}: command should include label`);
    assert((command.speech || '').length >= 8, `${name}: command should include Bo speech`);
    assert((command.counter || '').length >= 4, `${name}: command should name what it counters`);
    assert((command.risk || '').length >= 6, `${name}: command should include risk`);
    assert((command.effect || '').length >= 6, `${name}: command should include effect`);
  }
}

function assertNegotiationTable(snap, name) {
  const lines = snap.battle?.tableLines;
  assert(lines, `${name}: expected table dialogue lines`);
  for (const key of ['customer', 'bo', 'table']) {
    assert(
      (lines?.[key] || '').length >= 8,
      `${name}: table should include ${key}`,
    );
  }
  const tokens = snap.battle?.tableTokens || [];
  assert(tokens.length === 3, `${name}: expected three table tokens, got ${tokens.length}`);
  const labels = tokens.map((token) => token.label || '').join('/');
  for (const label of ['钱', '关系', '边界']) {
    assert(labels.includes(label), `${name}: missing table token ${label}`);
  }
  const props = snap.battle?.tableProps || [];
  assert(props.length === 3, `${name}: expected three story props on the negotiation table`);
  const propLabels = props.map((prop) => prop.label || '').join('/');
  for (const label of ['账单', '上线', '再梳一次']) {
    assert(propLabels.includes(label), `${name}: missing table story prop ${label}`);
  }
  for (const prop of props) {
    assert((prop.line || '').length >= 6, `${name}: table prop should include story context`);
  }
}

function assertBattleTurnBeat(snap, name, expectResolved = false) {
  const turn = snap.battle?.turnBeat;
  assert(turn, `${name}: expected structured turn beat`);
  for (const key of ['customer', 'bo', 'result']) {
    assert(
      (turn?.[key] || '').length >= 10,
      `${name}: turn beat should include ${key}`,
    );
  }
  assert(
    ['waiting', 'countered', 'risk', 'phase'].includes(turn?.tone || ''),
    `${name}: turn beat should include a known tone, got "${turn?.tone || ''}"`,
  );
  if (expectResolved) {
    assert(
      turn?.tone !== 'waiting',
      `${name}: turn beat should update after a skill`,
    );
    assert(
      (snap.battle?.lastImpact?.deltas || []).length >= 2,
      `${name}: resolved turn should keep visible deltas`,
    );
  }
}

function assertStoryPressure(snap, name) {
  const pressure = snap.battle?.storyPressure;
  assert(pressure, `${name}: expected a story pressure line`);
  assert(
    (pressure?.source || '').length >= 4,
    `${name}: story pressure should include source`,
  );
  assert(
    (pressure?.line || '').length >= 12,
    `${name}: story pressure should include customer line`,
  );
  assert(
    (pressure?.replyHint || '').length >= 6,
    `${name}: story pressure should include reply hint`,
  );
  assert(
    Array.isArray(pressure?.counters) && pressure.counters.length >= 1,
    `${name}: story pressure should include counter skills`,
  );
}

function assertBattleImpact(snap, name) {
  const impact = snap.battle?.lastImpact;
  assert(impact, `${name}: expected battle impact feedback`);
  assert(
    (impact?.title || '').length >= 6,
    `${name}: battle impact should include a title`,
  );
  assert(
    (impact?.customerLine || '').length >= 8,
    `${name}: battle impact should include customer response`,
  );
  assert(
    (impact?.deltas || []).length >= 2,
    `${name}: battle impact should include at least two deltas`,
  );
}

function assertEndingEchoes(snap, name) {
  const echoes = snap.endingEchoes || [];
  assert(echoes.length >= 4, `${name}: expected four ending echoes`);
  const speakers = echoes.map((echo) => echo.speaker || '').join('/');
  for (const speaker of ['finance', 'boss', 'customer', 'bo']) {
    assert(speakers.includes(speaker), `${name}: missing ${speaker} ending echo`);
  }
  for (const echo of echoes.slice(0, 4)) {
    assert((echo.line || '').length >= 8, `${name}: ending echo should be readable`);
  }
  assertEndingScene(snap, name);
}

function assertEndingScene(snap, name) {
  const scene = snap.endingScene;
  assert(scene, `${name}: expected ending closing scene`);
  assert((scene.title || '').length >= 4, `${name}: ending scene needs route title`);
  assert((scene.line || '').length >= 18, `${name}: ending scene needs closing line`);
  assert(
    ['mobile-echo-stack', 'desktop-echo-stack'].includes(scene.layout || ''),
    `${name}: ending scene should render as readable echo stack, got "${scene.layout || ''}"`,
  );
  assert(
    scene.echoCount >= 4,
    `${name}: ending scene should keep four role echoes, got ${scene.echoCount || 0}`,
  );
  for (const prop of ['账单', '范围单', '试点记录']) {
    assert(
      (scene.props || []).includes(prop),
      `${name}: ending scene missing prop ${prop}`,
    );
  }
}

function nameSafe(value) {
  return value.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

async function playBattleSequence(
  page,
  name,
  sequence,
  expectedEndings,
  screenshotName,
  options = {},
) {
  let snap;
  let phaseBreaks = 0;
  let capturedImpact = false;
  for (const skill of sequence) {
    snap = await snapshot(page);
    if (snap.mode === 'ending') break;
    await page.evaluate((skillId) => {
      window.__YUANBO_PROLOGUE_QA__.useSkill(skillId);
    }, skill);
    await page.waitForTimeout(120);
    snap = await snapshot(page);
    assertBattleImpact(snap, `${name}-${skill}`);
    assertBattleTurnBeat(snap, `${name}-${skill} resolved turn`, true);
    if (
      !capturedImpact &&
      snap.battle?.lastImpact &&
      snap.mode === 'battle' &&
      snap.modalTitle !== '谈判阶段突破'
    ) {
      capturedImpact = true;
      await page.screenshot({
        path: `${outDir}/${name}-battle-impact.png`,
        fullPage: true,
      });
    }
    if (snap.modalTitle === '谈判阶段突破') {
      phaseBreaks += 1;
      assertPhaseBreakCard(snap, `${name}-phase-break-${phaseBreaks}`);
      await page.screenshot({
        path: `${outDir}/${name}-phase-break-${phaseBreaks}.png`,
        fullPage: true,
      });
      await choose(page, 0);
    }
  }
  snap = await snapshot(page);
  if (snap.modalTitle === '镜头转场') {
    assertBridgeCard(snap, `${name} ending bridge`, 'ending');
    await page.screenshot({
      path: `${outDir}/${name}-ending-bridge.png`,
      fullPage: true,
    });
    await choose(page, 0);
    snap = await snapshot(page);
  }
  assert(snap.mode === 'ending', `${name}: battle did not reach ending`);
  assertStoryCard(snap, `${name} ending`, 'ending');
  assertEndingEchoes(snap, `${name} ending echoes`);
  assertMilestones(snap, `${name} ending milestones`, ['final', 'ending']);
  const minPhaseBreaks = options.minPhaseBreaks ?? 2;
  assert(
    phaseBreaks >= minPhaseBreaks,
    `${name}: expected at least ${minPhaseBreaks} negotiation phase breaks, got ${phaseBreaks}`,
  );
  assert(
    Math.abs(snap.camera.scrollY) <= 1,
    `${name}: ending camera should reset, got scrollY=${snap.camera.scrollY}`,
  );
  assert(
    expectedEndings.includes(snap.ending),
    `${name}: expected ending ${expectedEndings.join('/')}, got ${snap.ending}`,
  );
  await page.screenshot({
    path: `${outDir}/${name}-${screenshotName}.png`,
    fullPage: true,
  });
  return snap;
}

async function enterBattleRoute(page, name, customerChoice, reversalChoice) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  await interactWith(page, 'desk', 0, `${name}-desk`, {
    expectResult: true,
    expectBridge: true,
    expectOpeningInboxBoard: true,
  });
  await completeLedgerSorting(page, `${name}-ledger-sort`);
  await interactWith(page, 'ledger', 0, '', {
    expectForecast: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-audit`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'whiteboard', 0, '', {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'whiteboard', 0, '', {
    expectForecast: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss`, {
    expectResult: true,
    expectBossLaunchBoard: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss-rehearsal`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'contract', 0, '', {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'contract', 0, '', {
    expectForecast: true,
  });
  await interactWith(page, 'customer', customerChoice, `${name}-customer`, {
    expectResult: true,
    expectJokeBoard: true,
  });
  await interactWith(page, 'customer', reversalChoice, `${name}-customer-reversal`, {
    expectResult: true,
    expectCustomerReversalBoard: true,
  });
  const snap = await snapshot(page);
  assert(snap.mode === 'battle', `${name}: route should enter battle`);
  assertBattleReadable(snap, `${name} battle readability`);
}

async function storyFlow(page, name) {
  let snap = await snapshot(page);
  assert(snap.beat === 'wake', `${name}: should start at wake`);
  assertMilestones(snap, `${name} opening`, ['open']);
  assertSceneCue(snap, name, '三群同时炸');
  assertStoryCard(snap, `${name} wake`, 'desk');
  assert(
    snap.storyStep?.total === 9,
    `${name}: expected 9 story steps, got ${snap.storyStep?.total}`,
  );
  assert(snap.objective.includes('工位'), `${name}: wake objective should mention desk`);
  assertOpeningInbox(snap, `${name} opening inbox`);
  await assertCanvasClickWalk(page, `${name} click-walk`);
  await assertClickTargetApproach(page, `${name} click-target-approach`);
  await assertOpeningMessageClick(page, `${name} direct-opening-message`);
  await assertNoMaterialBattleGate(page, `${name} no-material`);
  snap = await snapshot(page);
  await interactWith(page, 'desk', 0, `${name}-desk`, {
    expectResult: true,
    expectBridge: true,
    expectOpeningInboxBoard: true,
  });
  snap = await snapshot(page);
  assert(snap.beat === 'finance', `${name}: desk should advance to finance`);
  assertMilestones(snap, `${name} act1`, ['open', 'act1']);
  assertSceneCue(snap, name, '账单拍桌');
  assertStoryCard(snap, `${name} finance`, 'finance');
  await completeLedgerSorting(page, `${name}-ledger`);
  await interactWith(page, 'ledger', 0, `${name}-ledger-card-2`, {
    expectForecast: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assert(
    snap.beat === 'financeAudit',
    `${name}: finance should advance to finance audit`,
  );
  assertSceneCue(snap, name, '谁来背账');
  assertStoryCard(snap, `${name} finance audit`, 'finance');
  await page.screenshot({
    path: `${outDir}/${name}-finance-audit.png`,
    fullPage: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-audit-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assert(snap.beat === 'boss', `${name}: finance audit should advance to boss`);
  assert(
    snap.zoneOutcomes?.finance === '已报价',
    `${name}: finance zone should remember quote outcome, got "${snap.zoneOutcomes?.finance || ''}"`,
  );
  assertMilestones(snap, `${name} act2`, ['open', 'act1', 'act2']);
  assertSceneCue(snap, name, '今天上线');
  assertStoryCard(snap, `${name} boss`, 'boss');
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-1`, {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-2`, {
    expectForecast: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectBossLaunchBoard: true,
  });
  snap = await snapshot(page);
  assert(
    snap.beat === 'bossRehearsal',
    `${name}: boss should advance to rehearsal`,
  );
  assertSceneCue(snap, name, '上线彩排');
  assertStoryCard(snap, `${name} rehearsal`, 'boss');
  await page.screenshot({
    path: `${outDir}/${name}-boss-rehearsal.png`,
    fullPage: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss-rehearsal-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assert(
    snap.beat === 'customer',
    `${name}: rehearsal should advance to customer`,
  );
  assert(
    snap.zoneOutcomes?.boss === '失败退路',
    `${name}: boss zone should remember rollback outcome, got "${snap.zoneOutcomes?.boss || ''}"`,
  );
  assertMilestones(snap, `${name} act3`, ['open', 'act1', 'act2', 'act3']);
  assertSceneCue(snap, name, '免费再梳一次');
  assertStoryCard(snap, `${name} customer`, 'customer');
  await interactWith(page, 'contract', 0, `${name}-contract-card-1`, {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'contract', 0, `${name}-contract-card-2`, {
    expectForecast: true,
  });
  snap = await snapshot(page);
  assert(
    snap.clues.length >= 9,
    `${name}: evidence collection failed, got ${snap.clues.length}`,
  );
  await interactWith(page, 'customer', 1, `${name}-customer-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectJokeBoard: true,
  });
  snap = await snapshot(page);
  assert(
    snap.beat === 'customerReversal',
    `${name}: customer should advance to reversal`,
  );
  assertSceneCue(snap, name, '顺手全部上线');
  assertStoryCard(snap, `${name} customer reversal`, 'customer');
  await page.screenshot({
    path: `${outDir}/${name}-customer-reversal.png`,
    fullPage: true,
  });
  await interactWith(page, 'customer', 1, `${name}-customer-reversal-dialog`, {
    expectResult: true,
    expectBridge: true,
    expectCustomerReversalBoard: true,
  });
  snap = await snapshot(page);
  assert(snap.mode === 'battle', `${name}: customer reversal should start battle`);
  assert(
    snap.zoneOutcomes?.customer === '补试点',
    `${name}: customer zone should remember bounded-comp outcome, got "${snap.zoneOutcomes?.customer || ''}"`,
  );
  assertMilestones(snap, `${name} final`, ['open', 'act1', 'act2', 'act3', 'final']);
  assertStoryCard(snap, `${name} battle`, 'battle');
  assertBattleReadable(snap, `${name} battle readability`);
  assert(
    snap.decisions.length >= 6,
    `${name}: expected at least 6 authored decisions before battle, got ${snap.decisions.length}`,
  );
  assert(
    Math.abs(snap.camera.scrollY) <= 1,
    `${name}: battle camera should reset, got scrollY=${snap.camera.scrollY}`,
  );
  await page.screenshot({ path: `${outDir}/${name}-battle.png`, fullPage: true });

  const sequence = [
    'quote',
    'compensate',
    'boundary',
    'compensate',
    'boundary',
    'walkaway',
    'quote',
    'boundary',
    'walkaway',
  ];
  snap = await playBattleSequence(
    page,
    name,
    sequence,
    ['paid', 'bounded-comp', 'clean-walkaway', 'poc-limbo'],
    'ending',
  );
  assertMilestones(snap, `${name} ending`, [
    'open',
    'act1',
    'act2',
    'act3',
    'final',
    'ending',
  ]);
}

async function endingRouteFlow(page, name, route) {
  await enterBattleRoute(page, name, route.customerChoice, route.reversalChoice);
  const snap = await playBattleSequence(
    page,
    name,
    route.sequence,
    [route.expectedEnding],
    `${route.expectedEnding}-ending`,
    { minPhaseBreaks: route.minPhaseBreaks ?? 2 },
  );
  assert(
    snap.ending === route.expectedEnding,
    `${name}: route expected ${route.expectedEnding}, got ${snap.ending}`,
  );
}

async function debtPressureFlow(page, name) {
  let snap = await snapshot(page);
  assert(snap.beat === 'wake', `${name}: should start at wake`);
  await interactWith(page, 'desk', 0, '', {
    expectOpeningInboxBoard: true,
  });
  await interactWith(page, 'finance', 1, `${name}-finance-empathy`, {
    expectResult: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assertDebts(snap, name, ['pricing-limbo']);
  await interactWith(page, 'finance', 2, `${name}-finance-self-bear`, {
    expectResult: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assertDebts(snap, name, ['pricing-limbo', 'budget-blame']);
  await interactWith(page, 'boss', 2, `${name}-boss-hard`, {
    expectResult: true,
    expectBossLaunchBoard: true,
  });
  snap = await snapshot(page);
  assertDebts(snap, name, ['budget-blame', 'full-launch']);
  await interactWith(page, 'boss', 2, `${name}-boss-overpromise`, {
    expectResult: true,
    expectForecast: true,
  });
  snap = await snapshot(page);
  assertDebts(snap, name, ['full-launch', 'overpromise']);
  await interactWith(page, 'customer', 1, `${name}-customer-compensate`, {
    expectResult: true,
    expectJokeBoard: true,
  });
  snap = await snapshot(page);
  assertDebts(snap, name, ['compensation-habit']);
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.interactWith('customer'));
  await page.waitForTimeout(100);
  snap = await snapshot(page);
  assertCustomerReversalBoard(snap, `${name} customer reversal board before forced battle`);
  await choose(page, 0);
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '上桌前还缺东西',
    `${name}: debt route should hit battle readiness gate before forced battle`,
  );
  assert(
    snap.battleReadiness?.ready === false,
    `${name}: debt route should be marked unready before forced battle`,
  );
  await page.screenshot({
    path: `${outDir}/${name}-forced-battle-gate.png`,
    fullPage: true,
  });
  await choose(page, 1);
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '现场反应',
    `${name}: forced battle should still show the customer reversal result card`,
  );
  assertOutcomeCard(snap, `${name} forced battle result card`);
  await choose(page, 0);
  await dismissBridgeIfPresent(page, `${name}-forced-battle`);
  snap = await snapshot(page);
  assert(snap.mode === 'battle', `${name}: debt route should enter battle`);
  assertBattleReadable(snap, `${name} debt battle readability`);
  assertDebts(snap, name, [
    'budget-blame',
    'full-launch',
    'overpromise',
    'compensation-habit',
  ]);
  assert(
    snap.battle?.client?.anger >= 65 || snap.battle?.client?.scope >= 75,
    `${name}: debt route should make battle visibly harder`,
  );
  await page.screenshot({ path: `${outDir}/${name}-debt-battle.png`, fullPage: true });
  await page.evaluate(() => {
    window.__YUANBO_PROLOGUE_QA__.useSkill('breathe');
  });
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assertBattleImpact(snap, `${name}-breathe-impact`);
  await page.screenshot({ path: `${outDir}/${name}-battle-impact.png`, fullPage: true });
}

async function tradeoffFlow(page, name) {
  let snap = await snapshot(page);
  assert(snap.timeLeft === 6, `${name}: should start with 6 time, got ${snap.timeLeft}`);
  await interactWith(page, 'desk', 0, '', {
    expectOpeningInboxBoard: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-audit`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss`, {
    expectResult: true,
    expectBossLaunchBoard: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss-rehearsal`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'customer', 1, `${name}-customer`, {
    expectResult: true,
    expectJokeBoard: true,
  });
  await interactWith(page, 'briefing', 0, `${name}-prep-pricing`, {
    expectResult: true,
    expectPrepWorkbench: true,
  });
  snap = await snapshot(page);
  assertPrep(snap, name, ['pricing-rehearsal']);
  assert(snap.timeLeft === 5, `${name}: first prep should spend time`);
  await interactWith(page, 'briefing', 0, `${name}-prep-poc`, {
    expectResult: true,
    expectPrepWorkbench: true,
  });
  snap = await snapshot(page);
  assertPrep(snap, name, ['pricing-rehearsal', 'poc-demo']);
  assert(snap.timeLeft === 4, `${name}: second prep should spend time`);

  await completeLedgerSorting(page, `${name}-ledger`);
  await interactWith(page, 'ledger', 0, `${name}-ledger-card-2`, {
    expectForecast: true,
  });
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-1`, {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'contract', 0, `${name}-contract-card-1`, {
    expectForecast: true,
    forecastCount: 3,
  });
  snap = await snapshot(page);
  assert(snap.timeLeft === 0, `${name}: prep plus evidence should exhaust time`);
  assert(
    snap.timeLog?.length === 6,
    `${name}: expected 6 time log entries, got ${snap.timeLog?.length}`,
  );

  await page.evaluate(() => {
    window.__YUANBO_PROLOGUE_QA__.interactWith('whiteboard');
  });
  await page.waitForTimeout(100);
  await choose(page, 0);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '资料行动用完',
    `${name}: expected no-time dialog, got "${snap.modalTitle || ''}"`,
  );
  assert(snap.timeLeft === 0, `${name}: no-time attempt should not go negative`);
  await page.screenshot({ path: `${outDir}/${name}-time-cap.png`, fullPage: true });
  await choose(page, 0);
}

async function restoreFlow(page, name) {
  let snap = await snapshot(page);
  assert(
    snap.storageKey === 'bo-chaos:yuanbo-first-day-prologue:v1',
    `${name}: unexpected storage key ${snap.storageKey || ''}`,
  );
  await interactWith(page, 'desk', 0, '', {
    expectOpeningInboxBoard: true,
  });
  snap = await snapshot(page);
  assert(snap.beat === 'finance', `${name}: desk should move to finance before reload`);
  snap = await reloadAndSnapshot(page);
  assert(snap.beat === 'finance', `${name}: map reload should preserve finance beat`);
  assert(snap.mode === 'map', `${name}: map reload should remain playable map`);
  assertMilestones(snap, `${name} map reload`, ['open', 'act1']);

  await enterBattleRoute(page, `${name}-battle`, 1, 1);
  snap = await reloadAndSnapshot(page);
  assert(snap.mode === 'battle', `${name}: battle reload should preserve battle mode`);
  assertBattleReadable(snap, `${name} battle reload readability`);

  await page.evaluate(() => {
    window.__YUANBO_PROLOGUE_QA__.useSkill('quote');
  });
  await page.waitForTimeout(140);
  snap = await reloadAndSnapshot(page);
  assert(
    snap.mode === 'battle' || snap.mode === 'ending',
    `${name}: post-skill reload should preserve a playable battle/ending state`,
  );
  if (snap.mode === 'battle') assertBattleReadable(snap, `${name} post-skill reload readability`);

  snap = await playBattleSequence(
    page,
    name,
    ['compensate', 'boundary', 'quote', 'boundary', 'walkaway', 'boundary'],
    ['paid', 'bounded-comp', 'clean-walkaway', 'poc-limbo'],
    'ending',
    { minPhaseBreaks: 1 },
  );
  const ending = snap.ending;
  const code = await page.evaluate(() =>
    window.__YUANBO_PROLOGUE_QA__.exportCode(),
  );
  assert(code.startsWith('YBPROLOGUE1:'), `${name}: exported code should use save prefix`);
  snap = await reloadAndSnapshot(page);
  assert(snap.mode === 'ending', `${name}: ending reload should preserve ending mode`);
  assert(snap.ending === ending, `${name}: ending reload should preserve ending ${ending}`);

  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  snap = await snapshot(page);
  assert(snap.beat === 'wake', `${name}: reset before import should return to wake`);
  const ok = await page.evaluate((saveCode) => {
    return window.__YUANBO_PROLOGUE_QA__.importCode(saveCode);
  }, code);
  assert(ok, `${name}: importCode should accept exported save`);
  snap = await snapshot(page);
  assert(snap.mode === 'ending', `${name}: imported save should restore ending mode`);
  assert(snap.ending === ending, `${name}: imported save should restore ending ${ending}`);
  await page.screenshot({ path: `${outDir}/${name}-imported-ending.png`, fullPage: true });
}

async function escapeFlow(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.interactWith('desk'));
  await page.waitForTimeout(100);
  let snap = await snapshot(page);
  assertOpeningInboxBoard(snap, `${name} escape opening inbox board`);
  await choose(page, 0);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '现场反应',
    `${name}: expected desk outcome before escape, got "${snap.modalTitle || ''}"`,
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '镜头转场',
    `${name}: escape on blocking outcome should continue to bridge, got "${snap.modalTitle || ''}"`,
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.mode === 'map' && snap.beat === 'finance' && !snap.modalTitle,
    `${name}: escape on blocking bridge should redraw finance map, got mode=${snap.mode} beat=${snap.beat} modal=${snap.modalTitle || ''}`,
  );

  await enterBattleRoute(page, `${name}-battle`, 1, 1);
  snap = await snapshot(page);
  assert(snap.mode === 'battle', `${name}: setup should enter battle`);
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.useSkill('quote'));
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  if (snap.modalTitle === '谈判阶段突破') {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    snap = await snapshot(page);
    assert(
      snap.mode === 'battle' && !snap.modalTitle,
      `${name}: escape on phase break should return to playable battle`,
    );
  } else {
    assertBattleReadable(snap, `${name} post-escape battle remains readable`);
  }
}

async function noTimeFreshClueFlow(page, name) {
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.reset());
  await interactWith(page, 'desk', 0, '', {
    expectOpeningInboxBoard: true,
  });
  await completeLedgerSorting(page, `${name}-ledger`);
  await interactWith(page, 'ledger', 0, `${name}-ledger-card-2`, {
    expectForecast: true,
  });
  await interactWith(page, 'ledger', 0, `${name}-ledger-card-3`, {
    expectForecast: true,
    forecastCount: 1,
  });
  await interactWith(page, 'finance', 0, `${name}-finance`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'finance', 0, `${name}-finance-audit`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-1`, {
    expectForecast: true,
    forecastCount: 3,
  });
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-2`, {
    expectForecast: true,
  });
  await interactWith(page, 'whiteboard', 0, `${name}-whiteboard-card-3`, {
    expectForecast: true,
    forecastCount: 1,
  });
  let snap = await snapshot(page);
  assert(snap.timeLeft === 0, `${name}: setup should exhaust time, got ${snap.timeLeft}`);
  assert(
    !snap.clues?.includes('范围单模板'),
    `${name}: setup should not already include contract core clue`,
  );
  await interactWith(page, 'boss', 1, `${name}-boss`, {
    expectResult: true,
    expectBossLaunchBoard: true,
  });
  await interactWith(page, 'boss', 1, `${name}-boss-rehearsal`, {
    expectResult: true,
    expectForecast: true,
  });
  await interactWith(page, 'customer', 1, `${name}-customer`, {
    expectResult: true,
    expectJokeBoard: true,
  });
  snap = await snapshot(page);
  assert(snap.beat === 'customerReversal', `${name}: setup should reach reversal`);
  await page.evaluate(() => window.__YUANBO_PROLOGUE_QA__.interactWith('contract'));
  await page.waitForTimeout(120);
  snap = await snapshot(page);
  assert(
    snap.modalTitle === '范围单打印机：今天没时间翻新资料',
    `${name}: fresh no-time clue should show no-time dialog, got "${snap.modalTitle || ''}"`,
  );
  assert(
    !snap.clues?.includes('范围单模板'),
    `${name}: fresh no-time clue should not mutate core clue`,
  );
  assert(snap.timeLeft === 0, `${name}: fresh no-time clue should keep time at 0`);
  await page.screenshot({ path: `${outDir}/${name}-fresh-clue-time-cap.png`, fullPage: true });
  await choose(page, 0);
}

await runPage('desktop', { width: 1280, height: 800 }, (page) =>
  storyFlow(page, 'desktop'),
);
await runPage('mobile', { width: 390, height: 844, isMobile: true }, (page) =>
  storyFlow(page, 'mobile'),
);
await runPage('debt', { width: 1280, height: 800 }, (page) =>
  debtPressureFlow(page, 'debt'),
);
await runPage('tradeoff', { width: 1280, height: 800 }, (page) =>
  tradeoffFlow(page, 'tradeoff'),
);
await runPage('mobile-tradeoff', { width: 390, height: 844, isMobile: true }, (page) =>
  tradeoffFlow(page, 'mobile-tradeoff'),
);
await runPage('restore', { width: 1280, height: 800 }, (page) =>
  restoreFlow(page, 'restore'),
);
await runPage('escape', { width: 1280, height: 800 }, (page) =>
  escapeFlow(page, 'escape'),
);
await runPage('no-time-fresh-clue', { width: 1280, height: 800 }, (page) =>
  noTimeFreshClueFlow(page, 'no-time-fresh-clue'),
);
await runPage('route-paid', { width: 1280, height: 800 }, (page) =>
  endingRouteFlow(page, 'route-paid', {
    customerChoice: 0,
    reversalChoice: 0,
    expectedEnding: 'paid',
    sequence: [
      'quote',
      'boundary',
      'compensate',
      'boundary',
      'quote',
      'boundary',
      'walkaway',
    ],
  }),
);
await runPage('route-bounded', { width: 1280, height: 800 }, (page) =>
  endingRouteFlow(page, 'route-bounded', {
    customerChoice: 1,
    reversalChoice: 1,
    expectedEnding: 'bounded-comp',
    sequence: [
      'compensate',
      'boundary',
      'compensate',
      'boundary',
      'compensate',
      'boundary',
    ],
  }),
);
await runPage('route-walkaway', { width: 1280, height: 800 }, (page) =>
  endingRouteFlow(page, 'route-walkaway', {
    customerChoice: 2,
    reversalChoice: 2,
    expectedEnding: 'clean-walkaway',
    sequence: [
      'boundary',
      'quote',
      'boundary',
      'compensate',
      'boundary',
      'walkaway',
      'breathe',
      'walkaway',
      'boundary',
    ],
  }),
);
await runPage('route-burnout', { width: 1280, height: 800 }, (page) =>
  endingRouteFlow(page, 'route-burnout', {
    customerChoice: 2,
    reversalChoice: 2,
    expectedEnding: 'free-burnout',
    minPhaseBreaks: 0,
    sequence: [
      'walkaway',
      'walkaway',
      'walkaway',
      'walkaway',
      'walkaway',
      'walkaway',
    ],
  }),
);

await browser.close();

if (failures.length) {
  console.error('yuanbo prologue browser probe failed');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`yuanbo prologue browser probe passed: ${url}`);
console.log(`screenshots: ${outDir}`);
