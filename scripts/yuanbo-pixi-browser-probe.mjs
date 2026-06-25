#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const URL = process.env.YUANBO_URL || 'http://localhost:4321/bo/yuanbo-game/';
const STORAGE_KEY = 'bo-chaos:yuanbo-pixi-alpha:v1';
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ignoreNetworkIssue(urlOrText) {
  return urlOrText.includes('/dev-toolbar/') || urlOrText.includes('google-analytics.com/g/collect');
}

function worldToScreen(viewport, world, player) {
  const mobile = viewport.width <= 720 && viewport.height > viewport.width;
  const top = mobile ? 88 : 72;
  const bottom = mobile ? 28 : 24;
  const maxW = mobile ? viewport.width : Math.min(viewport.width - 48, 1120);
  const maxH = viewport.height - top - bottom;
  const scale = mobile ? 1.08 : Math.min(maxW / 960, maxH / 720);
  const viewW = maxW / scale;
  const viewH = maxH / scale;
  const cameraX = mobile ? clamp(player.x - viewW / 2, 0, 960 - viewW) : 0;
  const cameraY = mobile ? clamp(player.y - viewH / 2 + 38, 0, 720 - viewH) : 0;
  return {
    x: (viewport.width - Math.min(maxW, 960 * scale)) / 2 + (world.x - cameraX) * scale,
    y: top + (world.y - cameraY) * scale,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function metrics(page) {
  return page.evaluate((storageKey) => {
    const canvas = document.querySelector('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
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
      touchVisible:
        getComputedStyle(document.querySelector('.yrpg-touch-bridge') || document.body).display !== 'none',
      state,
    };
  }, STORAGE_KEY);
}

async function waitForGame(page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForFunction(
    (storageKey) => {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      try {
        return JSON.parse(raw).mapId === 'office';
      } catch {
        return false;
      }
    },
    STORAGE_KEY,
    { timeout: 15000 },
  );
}

async function checkDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text() !== 'Failed to load resource: the server responded with a status of 403 (Forbidden)') {
      errors.push(message.text());
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !ignoreNetworkIssue(response.url())) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    if (!ignoreNetworkIssue(request.url())) errors.push(`request failed ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await waitForGame(page);

  const initial = await metrics(page);
  assert(initial.canvasRect, 'desktop canvas missing');
  assert(Math.abs(initial.canvasRect.width - 1280) <= 2, 'desktop canvas width mismatch');
  assert(Math.abs(initial.canvasRect.height - 800) <= 2, 'desktop canvas height mismatch');
  assert(initial.documentScrollWidth <= initial.width + 2, 'desktop horizontal overflow');
  assert(initial.bodyScrollHeight <= initial.height + 2, 'desktop vertical overflow');

  const beforeX = initial.state.player.office.x;
  await page.keyboard.down('d');
  await page.waitForTimeout(360);
  await page.keyboard.up('d');
  const moved = await metrics(page);
  assert(moved.state.player.office.x > beforeX + 24, 'desktop keyboard movement did not update save state');

  const target = worldToScreen({ width: 1280, height: 800 }, { x: 318, y: 336 }, moved.state.player.office);
  await page.mouse.click(target.x, target.y);
  await page.waitForTimeout(260);
  const startButton = { x: 250 + 192, y: 541 + 22 };
  await page.mouse.click(startButton.x, startButton.y);
  await page.waitForFunction(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey) || '{}').scene === 'battle',
    STORAGE_KEY,
    { timeout: 5000 },
  );
  const battle = await metrics(page);
  assert(battle.documentScrollWidth <= battle.width + 2, 'desktop battle horizontal overflow');
  assert(errors.length === 0, `desktop console errors: ${errors.join(' | ')}`);
  await context.close();
}

async function checkMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text() !== 'Failed to load resource: the server responded with a status of 403 (Forbidden)') {
      errors.push(message.text());
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !ignoreNetworkIssue(response.url())) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    if (!ignoreNetworkIssue(request.url())) errors.push(`request failed ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await waitForGame(page);
  const initial = await metrics(page);
  assert(initial.canvasRect, 'mobile canvas missing');
  assert(Math.abs(initial.canvasRect.width - 390) <= 2, 'mobile canvas width mismatch');
  assert(Math.abs(initial.canvasRect.height - 844) <= 2, 'mobile canvas height mismatch');
  assert(initial.documentScrollWidth <= initial.width + 2, 'mobile horizontal overflow');
  assert(initial.bodyScrollHeight <= initial.height + 2, 'mobile vertical overflow');
  assert(initial.touchVisible, 'mobile touch bridge is not visible');

  await page.locator('.yrpg-touch-bridge__interact').tap();
  await page.waitForTimeout(260);
  const afterTap = await metrics(page);
  assert(afterTap.documentScrollWidth <= afterTap.width + 2, 'mobile overlay horizontal overflow');
  await page.touchscreen.tap(195, 712);
  await page.waitForFunction(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey) || '{}').scene === 'battle',
    STORAGE_KEY,
    { timeout: 5000 },
  );
  const battle = await metrics(page);
  assert(battle.documentScrollWidth <= battle.width + 2, 'mobile battle horizontal overflow');
  assert(battle.bodyScrollHeight <= battle.height + 2, 'mobile battle vertical overflow');
  assert(errors.length === 0, `mobile console errors: ${errors.join(' | ')}`);
  await context.close();
}

const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(MAC_CHROME) ? MAC_CHROME : undefined,
});
try {
  await checkDesktop(browser);
  await checkMobile(browser);
  console.log(`browser probe passed: ${URL}`);
} finally {
  await browser.close();
}
