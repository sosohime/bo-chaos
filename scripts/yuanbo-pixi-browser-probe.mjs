#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const RAW_URL = process.env.YUANBO_URL || 'http://localhost:4321/bo/yuanbo-game/';
const GAME_URL = withQa(RAW_URL);
const STORAGE_KEY = 'bo-chaos:yuanbo-pixi-alpha:v2';
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = resolve(process.cwd(), process.env.YUANBO_QA_OUT || 'tmp/yuanbo-qa');

mkdirSync(OUT_DIR, { recursive: true });

function withQa(rawUrl) {
  const url = new URL(rawUrl);
  url.searchParams.set('qa', '1');
  return url.toString();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertRange(value, min, max, message) {
  assert(value >= min && value <= max, `${message}: got ${round(value)}, expected ${min}..${max}`);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function ignoreNetworkIssue(urlOrText) {
  return (
    urlOrText.includes('/dev-toolbar/') ||
    urlOrText.includes('/node_modules/.vite/deps/') ||
    urlOrText.includes('google-analytics.com/') ||
    urlOrText.includes('googletagmanager.com/') ||
    urlOrText.includes('sentry.io/')
  );
}

function errorCollector(page) {
  const errors = [];
  page.on('console', (message) => {
    const text = message.text();
    const ignoredLoadError =
      text === 'Failed to load resource: the server responded with a status of 403 (Forbidden)' ||
      text === 'Failed to load resource: the server responded with a status of 404 (Not Found)';
    if (message.type() === 'error' && !ignoredLoadError) errors.push(text);
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !ignoreNetworkIssue(response.url())) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (!ignoreNetworkIssue(request.url())) {
      errors.push(`request failed ${request.url()} ${request.failure()?.errorText || ''}`);
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const touch = document.querySelector('.yrpg-touch-bridge');
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollHeight: document.body.scrollHeight,
      canvasRect: canvasRect
        ? {
            left: canvasRect.left,
            top: canvasRect.top,
            width: canvasRect.width,
            height: canvasRect.height,
          }
        : null,
      touchVisible: touch ? getComputedStyle(touch).display !== 'none' : false,
    };
  });
}

async function waitForGame(page) {
  await page.goto(GAME_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.__YUANBO_QA__), { timeout: 15000 });
  return qaAction(page, 'reset');
}

async function qa(page) {
  return page.evaluate(() => window.__YUANBO_QA__.snapshot());
}

async function qaAction(page, action, ...args) {
  return page.evaluate(
    ({ action, args }) => window.__YUANBO_QA__[action](...args),
    { action, args },
  );
}

async function storedState(page) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) || '{}'), STORAGE_KEY);
}

async function screenshot(page, name) {
  const path = resolve(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

function assertNoOverflow(metrics, label) {
  assert(metrics.canvasRect, `${label}: canvas missing`);
  assert(metrics.documentScrollWidth <= metrics.width + 2, `${label}: horizontal overflow ${metrics.documentScrollWidth} > ${metrics.width}`);
  assert(metrics.bodyScrollHeight <= metrics.height + 2, `${label}: vertical overflow ${metrics.bodyScrollHeight} > ${metrics.height}`);
}

function assertGrounded(snapshot, label) {
  assertRange(snapshot.player.footToShadowY, -4, 8, `${label}: player feet/shadow baseline`);
  snapshot.npcs.forEach((npc) => {
    assertRange(npc.footToShadowY, -4, 8, `${label}: ${npc.name} feet/shadow baseline`);
  });
}

function assertPlayerReadable(snapshot, label) {
  const rect = snapshot.player.spriteBounds;
  const mobile = snapshot.canvas.width <= 720 && snapshot.canvas.height > snapshot.canvas.width;
  const minY = mobile ? 118 : 68;
  const bottomGuard = mobile ? 128 : 8;
  assert(rect.width >= 36 && rect.height >= 58, `${label}: player sprite too small ${round(rect.width)}x${round(rect.height)}`);
  assert(rect.x >= -2, `${label}: player clipped left`);
  assert(rect.x + rect.width <= snapshot.canvas.width + 2, `${label}: player clipped right`);
  assert(rect.y >= minY - 2, `${label}: player under HUD`);
  assert(rect.y + rect.height <= snapshot.canvas.height - bottomGuard, `${label}: player under bottom controls`);
}

function assertMapRenderedOnce(snapshot, label) {
  assert(snapshot.scene === 'map', `${label}: expected map scene`);
  assert(snapshot.counts.renderedHotspots === snapshot.counts.expectedHotspots, `${label}: hotspot visual count mismatch`);
  assert(snapshot.counts.renderedNpcs === snapshot.counts.expectedNpcs, `${label}: NPC visual count mismatch`);
  assert(snapshot.assets.officeMap.includes('office-map-floor-v2'), `${label}: office map still uses baked prop asset`);
  assert(snapshot.assets.siteMap.includes('site-map-floor-v2'), `${label}: site map still uses baked prop asset`);
}

async function assertStableOverlay(page, title, label) {
  let snapshot = await qa(page);
  assert(snapshot.overlay.visible, `${label}: overlay did not open`);
  assert(snapshot.overlay.title === title, `${label}: wrong overlay title ${snapshot.overlay.title}`);
  await page.waitForTimeout(700);
  snapshot = await qa(page);
  assert(snapshot.overlay.visible, `${label}: overlay closed too early`);
  assert(snapshot.overlay.title === title, `${label}: overlay title changed`);
  assert(snapshot.overlay.ageMs >= 600, `${label}: overlay was not stable for 600ms`);
  return snapshot;
}

async function assertBattleUsableAfterReload(page, label) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(() => Boolean(window.__YUANBO_QA__), { timeout: 15000 });
  const snapshot = await qa(page);
  assert(snapshot.scene === 'battle', `${label}: reload did not restore battle scene`);
  assert(snapshot.battle?.questId === 'gpu', `${label}: reload restored wrong battle`);
  await qaAction(page, 'useSkill', 'report');
  const afterSkill = await qa(page);
  assert(afterSkill.battle?.lastSkill === 'report' || afterSkill.battle?.round > snapshot.battle.round || afterSkill.battle?.outcome, `${label}: battle not usable after reload`);
}

async function checkDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = errorCollector(page);
  let snapshot = await waitForGame(page);
  assertNoOverflow(await pageMetrics(page), 'desktop map');
  assertGrounded(snapshot, 'desktop map');
  assertPlayerReadable(snapshot, 'desktop map');
  assertMapRenderedOnce(snapshot, 'desktop map');
  await screenshot(page, 'desktop-map');

  const before = snapshot;
  await page.keyboard.down('d');
  await page.waitForTimeout(240);
  const movingA = await qa(page);
  await page.waitForTimeout(240);
  const movingB = await qa(page);
  await page.waitForTimeout(240);
  const movingC = await qa(page);
  await screenshot(page, 'walking-frame');
  await page.keyboard.up('d');
  assert(movingC.player.world.x - before.player.world.x >= 80, `desktop movement too small: ${round(movingC.player.world.x - before.player.world.x)}`);
  assert(movingC.player.direction === 'right', `desktop movement direction mismatch: ${movingC.player.direction}`);
  assert(movingA.player.moving || movingB.player.moving || movingC.player.moving, 'desktop movement never entered moving state');
  const frameChanges = [before, movingA, movingB, movingC].reduce((count, item, index, all) => {
    if (index === 0) return count;
    return count + Number(item.player.frame !== all[index - 1].player.frame);
  }, 0);
  assert(frameChanges >= 2, `desktop walk animation changed only ${frameChanges} times`);
  assertGrounded(movingC, 'desktop walking');
  await page.waitForTimeout(460);
  snapshot = await qa(page);
  assert(!snapshot.player.moving, 'desktop player still moving after keyup');
  assert(snapshot.player.frame === 0, `desktop player did not return to idle frame: ${snapshot.player.frame}`);
  assertGrounded(snapshot, 'desktop stopped');

  await qaAction(page, 'moveTo', 'office', 180, 170);
  await qaAction(page, 'interact');
  await assertStableOverlay(page, '今日经营面板', 'desktop task board');
  await screenshot(page, 'task-board');
  await qaAction(page, 'closeOverlay');

  await qaAction(page, 'moveTo', 'office', 760, 190);
  await qaAction(page, 'interact');
  await assertStableOverlay(page, '训练台', 'desktop training panel');
  await qaAction(page, 'closeOverlay');

  await qaAction(page, 'moveTo', 'office', 318, 336);
  await qaAction(page, 'interact');
  await assertStableOverlay(page, 'GPU 账单爆炸', 'desktop quest brief');
  await screenshot(page, 'quest-brief');
  await qaAction(page, 'closeOverlay');

  snapshot = await qaAction(page, 'startQuest', 'gpu');
  assert(snapshot.scene === 'battle' && snapshot.battle?.questId === 'gpu', 'desktop did not enter GPU battle');
  assertNoOverflow(await pageMetrics(page), 'desktop battle');
  await screenshot(page, 'battle');
  await qaAction(page, 'useSkill', 'report');
  snapshot = await qa(page);
  assert(snapshot.battle?.lastSkill === 'report' || snapshot.battle?.round > 1 || snapshot.battle?.outcome, 'desktop skill did not affect battle');
  await assertBattleUsableAfterReload(page, 'desktop battle reload');
  await screenshot(page, 'battle-after-reload');

  await forceFailureAndClearDebt(page);
  await checkBossPath(page);

  await qaAction(page, 'showSaveMenu');
  snapshot = await qa(page);
  assert(snapshot.saveOverlayVisible, 'desktop save menu did not open');
  await screenshot(page, 'save-menu');
  await qaAction(page, 'closeOverlay');

  assert(errors.length === 0, `desktop console/network errors: ${errors.join(' | ')}`);
  await context.close();
}

async function forceFailureAndClearDebt(page) {
  await qaAction(page, 'startQuest', 'gpu');
  const state = await storedState(page);
  state.scene = 'battle';
  state.battle.outcome = 'fail';
  state.battle.client.anger = 100;
  state.resources.energy = 0;
  await qaAction(page, 'setState', state);
  let snapshot = await qaAction(page, 'finishBattle');
  assert(snapshot.stateSummary.failed.includes('gpu'), 'failure path did not mark GPU as failed');
  assert(snapshot.stateSummary.issues.length > 0, 'failure path did not create售后债');
  const issuesBefore = snapshot.stateSummary.issues.length;
  await qaAction(page, 'moveTo', 'office', 150, 345);
  await qaAction(page, 'interact');
  await assertStableOverlay(page, '售后债板', 'debt panel');
  await page.mouse.click(442, 563);
  await page.waitForTimeout(260);
  snapshot = await qa(page);
  assert(snapshot.stateSummary.issues.length < issuesBefore, 'clear debt action did not reduce issues');
}

async function checkBossPath(page) {
  await qaAction(page, 'reset');
  const state = await storedState(page);
  state.mapId = 'site';
  state.scene = 'map';
  state.actionPoints = 3;
  state.completed = ['gpu', 'agent', 'sla', 'compliance'];
  state.resources = { cash: 1800, reputation: 72, energy: 100, patience: 100, boundary: 86, pressure: 12 };
  state.training = { pricing: 3, delivery: 3, sla: 3, review: 2, shadow: 3 };
  state.routes = { business: 40, delivery: 40, boundary: 40, shadow: 40 };
  state.level = 6;
  state.xp = 760;
  state.equippedSkills = ['anchor', 'report', 'poc', 'contract', 'fallback', 'milestone', 'slaExplain', 'shadow', 'shadowReview', 'review', 'bundle', 'split'];
  let snapshot = await qaAction(page, 'setState', state);
  assert(snapshot.npcs.some((npc) => npc.id === 'npc-boss'), 'boss path did not reveal boss NPC after 4 normal customers');
  snapshot = await qaAction(page, 'startQuest', 'boss');
  for (let i = 0; i < 18; i += 1) {
    snapshot = await qa(page);
    if (snapshot.battle?.outcome) break;
    snapshot = await qaAction(page, 'useRecommendedSkill');
  }
  snapshot = await qa(page);
  assert(snapshot.battle?.outcome === 'win', `boss path did not win, outcome=${snapshot.battle?.outcome || 'none'}`);
  snapshot = await qaAction(page, 'finishBattle');
  assert(snapshot.stateSummary.ending, 'boss win did not create ending');
}

async function checkMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = errorCollector(page);
  let snapshot = await waitForGame(page);
  let metrics = await pageMetrics(page);
  assertNoOverflow(metrics, 'mobile map');
  assert(metrics.touchVisible, 'mobile touch bridge is not visible');
  assertGrounded(snapshot, 'mobile map');
  assertPlayerReadable(snapshot, 'mobile map');
  assertMapRenderedOnce(snapshot, 'mobile map');
  await screenshot(page, 'mobile-map');

  const before = snapshot;
  const stick = await page.locator('.yrpg-touch-bridge__stick').boundingBox();
  assert(stick, 'mobile joystick missing');
  const cx = stick.x + stick.width / 2;
  const cy = stick.y + stick.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 56, cy, { steps: 6 });
  await page.waitForTimeout(760);
  snapshot = await qa(page);
  await screenshot(page, 'mobile-walking-frame');
  await page.mouse.up();
  assert(snapshot.player.world.x - before.player.world.x >= 80, `mobile joystick movement too small: ${round(snapshot.player.world.x - before.player.world.x)}`);
  assert(snapshot.player.moving, 'mobile joystick did not enter moving state');
  assert(snapshot.player.direction === 'right', `mobile joystick direction mismatch: ${snapshot.player.direction}`);
  assert(snapshot.player.frame !== 0, 'mobile joystick did not advance walk frame');
  assertGrounded(snapshot, 'mobile walking');
  await page.waitForTimeout(460);
  snapshot = await qa(page);
  assert(!snapshot.player.moving, 'mobile player still moving after joystick release');
  assert(snapshot.player.frame === 0, `mobile player did not return to idle frame: ${snapshot.player.frame}`);
  assertGrounded(snapshot, 'mobile stopped');

  await qaAction(page, 'moveTo', 'office', 318, 336);
  await page.locator('.yrpg-touch-bridge__interact').tap();
  await assertStableOverlay(page, 'GPU 账单爆炸', 'mobile quest brief');
  await screenshot(page, 'mobile-quest-brief');
  await qaAction(page, 'closeOverlay');
  snapshot = await qaAction(page, 'startQuest', 'gpu');
  assert(snapshot.scene === 'battle', 'mobile did not enter battle');
  metrics = await pageMetrics(page);
  assertNoOverflow(metrics, 'mobile battle');
  await screenshot(page, 'mobile-battle');
  assert(errors.length === 0, `mobile console/network errors: ${errors.join(' | ')}`);
  await context.close();
}

async function checkShortMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = errorCollector(page);
  await waitForGame(page);
  await qaAction(page, 'startQuest', 'gpu');
  assertNoOverflow(await pageMetrics(page), 'short mobile battle');
  await screenshot(page, 'short-mobile-battle');
  assert(errors.length === 0, `short mobile console/network errors: ${errors.join(' | ')}`);
  await context.close();
}

const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(MAC_CHROME) ? MAC_CHROME : undefined,
});

try {
  await checkDesktop(browser);
  await checkMobile(browser);
  await checkShortMobile(browser);
  console.log(`browser probe passed: ${GAME_URL}`);
  console.log(`screenshots: ${OUT_DIR}`);
} finally {
  await browser.close();
}
