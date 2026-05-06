#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const targetUrl = process.env.RECKFUL_URL ?? 'http://127.0.0.1:4321/reckful';
const outputRoot = resolve(
  process.env.VISUAL_OUT_DIR ?? '/private/tmp/bo-chaos-visual/reckful',
);
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = resolve(outputRoot, runId);

const viewports = [
  {
    name: 'mobile-360',
    width: 360,
    height: 1100,
    deviceScaleFactor: 2,
    desktop: false,
  },
  {
    name: 'mobile-390',
    width: 390,
    height: 1100,
    deviceScaleFactor: 2,
    desktop: false,
  },
  {
    name: 'mobile-430',
    width: 430,
    height: 1100,
    deviceScaleFactor: 2,
    desktop: false,
  },
  {
    name: 'tablet-768',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    desktop: false,
  },
  {
    name: 'desktop-edge-900',
    width: 900,
    height: 900,
    deviceScaleFactor: 1,
    desktop: true,
  },
  {
    name: 'desktop-retina-1024',
    width: 1024,
    height: 586,
    deviceScaleFactor: 2,
    desktop: true,
  },
  {
    name: 'desktop-1100',
    width: 1100,
    height: 1000,
    deviceScaleFactor: 1,
    desktop: true,
  },
  {
    name: 'desktop-retina-1100',
    width: 1100,
    height: 650,
    deviceScaleFactor: 2,
    desktop: true,
  },
  {
    name: 'desktop-1280',
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    desktop: true,
  },
  {
    name: 'desktop-retina-1434',
    width: 1434,
    height: 848,
    deviceScaleFactor: 2,
    desktop: true,
  },
  {
    name: 'desktop-retina-1434x700',
    width: 1434,
    height: 700,
    deviceScaleFactor: 2,
    desktop: true,
  },
  {
    name: 'desktop-1440',
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    desktop: true,
  },
];

const selectors = {
  hero: '.reckful-hero',
  heroGrid: '.reckful-hero-grid',
  route: '.reckful-route',
  title: '.reckful-title',
  titleText: '.reckful-title h1',
  objective: '.reckful-objective',
  actions: '.reckful-actions',
  primary: '.reckful-primary',
  secondary: '.reckful-secondary',
  dashboard: '.reckful-dashboard',
  tasks: '.reckful-tasks',
  status: '.reckful-status',
  companion: '.reckful-companion',
};

function roundedRect(rect) {
  if (!rect) return null;
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    left: Math.round(rect.left),
  };
}

function fail(checks, message, detail) {
  checks.push({ ok: false, message, detail });
}

function pass(checks, message, detail) {
  checks.push({ ok: true, message, detail });
}

async function inspectLayout(page, viewport) {
  return page.evaluate((selectorMap) => {
    const rects = Object.fromEntries(
      Object.entries(selectorMap).map(([key, selector]) => {
        const element = document.querySelector(selector);
        if (!element) return [key, null];
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return [
          key,
          {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            fontSize: style.fontSize,
            position: style.position,
            display: style.display,
            gridTemplateColumns: style.gridTemplateColumns,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          },
        ];
      }),
    );

    return {
      url: location.href,
      title: document.title,
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      media: {
        mobile: matchMedia('(max-width: 899px)').matches,
        desktop: matchMedia('(min-width: 900px)').matches,
        narrowDesktop: matchMedia(
          '(min-width: 900px) and (max-width: 1160px)',
        ).matches,
      },
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clientHeight: document.documentElement.clientHeight,
        scrollHeight: document.documentElement.scrollHeight,
      },
      rects,
    };
  }, selectors);
}

function runChecks(layout, viewport) {
  const checks = [];
  const { rects, document: doc } = layout;
  const horizontalOverflow = doc.scrollWidth - doc.clientWidth;

  if (horizontalOverflow > 1) {
    fail(checks, 'No horizontal document overflow', { horizontalOverflow });
  } else {
    pass(checks, 'No horizontal document overflow', { horizontalOverflow });
  }

  for (const [key, rect] of Object.entries(rects)) {
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      fail(checks, `${key} exists and has size`, roundedRect(rect));
    } else {
      pass(checks, `${key} exists and has size`, roundedRect(rect));
    }
  }

  for (const key of ['primary', 'secondary']) {
    const rect = rects[key];
    if (!rect) continue;
    const overflow = rect.scrollWidth - rect.clientWidth;
    if (overflow > 1) {
      fail(checks, `${key} label fits its button`, { overflow });
    } else {
      pass(checks, `${key} label fits its button`, { overflow });
    }
  }

  if (viewport.desktop) {
    const title = rects.titleText;
    const objective = rects.objective;
    const hero = rects.hero;
    const route = rects.route;
    const dashboard = rects.dashboard;
    if (title && objective) {
      const gap = objective.top - title.bottom;
      if (gap < 18) {
        fail(checks, 'Desktop title and objective card keep vertical air', {
          gap: Math.round(gap),
          title: roundedRect(title),
          objective: roundedRect(objective),
        });
      } else {
        pass(checks, 'Desktop title and objective card keep vertical air', {
          gap: Math.round(gap),
        });
      }
    }

    if (hero) {
      const minHeroWidth = Math.min(
        layout.viewport.innerWidth - 40,
        layout.viewport.innerWidth * 0.9,
      );
      if (hero.width < minHeroWidth) {
        fail(checks, 'Desktop hero uses responsive page width', {
          hero: roundedRect(hero),
          minHeroWidth: Math.round(minHeroWidth),
        });
      } else {
        pass(checks, 'Desktop hero uses responsive page width', {
          width: Math.round(hero.width),
        });
      }

      if (layout.viewport.innerWidth >= 1200) {
        const heroBottomGap = layout.viewport.innerHeight - hero.bottom;
        if (heroBottomGap < -6) {
          fail(checks, 'Large desktop hero fits first viewport height', {
            hero: roundedRect(hero),
            viewportHeight: layout.viewport.innerHeight,
          });
        } else {
          pass(checks, 'Large desktop hero fits first viewport height', {
            heroBottomGap: Math.round(heroBottomGap),
          });
        }
      }
    }

    if (objective && hero) {
      const insideHero =
        objective.top >= hero.top - 1 &&
        objective.left >= hero.left - 1 &&
        objective.right <= hero.right + 1 &&
        objective.bottom <= hero.bottom + 1;
      if (!insideHero) {
        fail(checks, 'Desktop objective card stays inside hero stage', {
          objective: roundedRect(objective),
          hero: roundedRect(hero),
        });
      } else {
        pass(checks, 'Desktop objective card stays inside hero stage');
      }
    }

    if (route && hero) {
      const routeVisible =
        route.left < hero.right - 120 &&
        route.right > hero.left + 120 &&
        route.bottom <= hero.bottom + 1;
      if (!routeVisible) {
        fail(checks, 'Desktop route remains visible inside hero stage', {
          route: roundedRect(route),
          hero: roundedRect(hero),
        });
      } else {
        pass(checks, 'Desktop route remains visible inside hero stage');
      }
    }

    if (dashboard && hero) {
      const gap = dashboard.top - hero.bottom;
      if (gap < -1) {
        fail(checks, 'Desktop dashboard starts after hero stage', {
          gap: Math.round(gap),
        });
      } else {
        pass(checks, 'Desktop dashboard starts after hero stage', {
          gap: Math.round(gap),
        });
      }
    }

    if (layout.media.narrowDesktop) {
      const titleFontSize = title?.fontSize
        ? Number.parseFloat(title.fontSize)
        : Number.NaN;
      if (Number.isFinite(titleFontSize) && titleFontSize > 64) {
        fail(checks, 'Narrow desktop title scale stays controlled', {
          fontSize: title.fontSize,
        });
      } else {
        pass(checks, 'Narrow desktop title scale stays controlled', {
          fontSize: title?.fontSize,
        });
      }

      if (objective && objective.height > 270) {
        fail(checks, 'Narrow desktop objective card stays compact', {
          height: Math.round(objective.height),
        });
      } else {
        pass(checks, 'Narrow desktop objective card stays compact', {
          height: objective ? Math.round(objective.height) : null,
        });
      }

      pass(checks, 'Narrow desktop uses the desktop map composition');
    }
  }

  if (!viewport.desktop) {
    const title = rects.title;
    const objective = rects.objective;
    const actions = rects.actions;
    const route = rects.route;
    const dashboard = rects.dashboard;
    if (title && objective && actions && route && dashboard) {
      const ordered =
        title.bottom <= objective.top + 1 &&
        objective.bottom <= actions.top + 1 &&
        actions.bottom <= route.top + 1 &&
        route.bottom <= dashboard.top + 1;
      if (!ordered) {
        fail(checks, 'Mobile modules follow the planned single-column order', {
          title: roundedRect(title),
          objective: roundedRect(objective),
          actions: roundedRect(actions),
          route: roundedRect(route),
          dashboard: roundedRect(dashboard),
        });
      } else {
        pass(checks, 'Mobile modules follow the planned single-column order');
      }
    }
  }

  return checks;
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const results = [];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
      });
      const consoleMessages = [];
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          consoleMessages.push({
            type: message.type(),
            text: message.text(),
          });
        }
      });
      page.on('pageerror', (error) => {
        consoleMessages.push({ type: 'pageerror', text: error.message });
      });

      await page.goto(targetUrl, { waitUntil: 'load' });
      await page.waitForTimeout(600);

      const screenshot = resolve(outputDir, `${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });

      const layout = await inspectLayout(page, viewport);
      const checks = runChecks(layout, viewport);
      const result = {
        viewport,
        screenshot,
        consoleMessages,
        layout,
        checks,
        ok: checks.every((check) => check.ok),
      };
      results.push(result);

      await writeFile(
        resolve(outputDir, `${viewport.name}.json`),
        JSON.stringify(result, null, 2),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const summary = {
    targetUrl,
    outputDir,
    ok: results.every((result) => result.ok),
    results: results.map((result) => ({
      name: result.viewport.name,
      ok: result.ok,
      screenshot: result.screenshot,
      failedChecks: result.checks.filter((check) => !check.ok),
      consoleMessages: result.consoleMessages,
    })),
  };

  await writeFile(
    resolve(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2),
  );

  for (const result of summary.results) {
    const marker = result.ok ? 'PASS' : 'FAIL';
    console.log(`${marker} ${result.name} ${result.screenshot}`);
    for (const failedCheck of result.failedChecks) {
      console.log(`  - ${failedCheck.message}`);
      if (failedCheck.detail) {
        console.log(`    ${JSON.stringify(failedCheck.detail)}`);
      }
    }
  }
  console.log(`Summary: ${resolve(outputDir, 'summary.json')}`);

  if (!summary.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
