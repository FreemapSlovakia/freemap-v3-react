#!/usr/bin/env node
// Captures the manual's screenshots from a running dev server into
// src/manual/images/<name>.<lang>.webp, each language in a fresh profile.
//
//   node scripts/manual-screenshots.mjs [name…]
//
// Env: FM_URL (default https://local.freemap.sk:9000), CHROMIUM (default
// /usr/bin/chromium). Needs `cwebp` on PATH.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const BASE = process.env.FM_URL ?? 'https://local.freemap.sk:9000';

const OUT = path.resolve('src/manual/images');

const LANGS = process.env.LANGS?.split(',') ?? ['sk', 'en'];

const MAP = 'map=13/48.7483/19.1480&layers=X';

// A hiking route across Banská Bystrica.
const ROUTE = 'points=48.7356/19.1458,48.7800/19.2350&transport=hiking';

// A track from Banská Bystrica north-east, as a drawn line.
const TRACK_LINE =
  '48.7395/19.1530,48.7520/19.1700,48.7650/19.1850,48.7780/19.1980,48.7905/19.2073';

// Toasts (attribution, cookie consent) would land in every shot. Dev-server
// CSS module names carry the module path.
const HIDE_CSS =
  '[class*="Toasts-module__toasts"] { display: none !important; }';

// A phone's viewport, for the shots taken a second time as a phone shows them.
const PHONE = { width: 390, height: 760 };

// On a phone a toolbar wider than the screen scrolls; in a picture that reads
// as cut off, so there it wraps onto more rows instead.
const WRAP_CSS =
  '.fm-toolbar > .btn-toolbar { flex-wrap: wrap !important; row-gap: var(--fm-space-1); }';

/**
 * `crop` is a selector (the union of what it matches, plus `pad` CSS px of
 * the map around it, 8 unless set, as far as the viewport goes);
 * without it the whole `viewport` is taken. `steps` runs before the capture.
 * `mobile` also takes it on a touch phone (`mobileViewport`, else `PHONE`), as
 * `<name>.<lang>.mobile.webp`, which a narrow screen shows instead.
 */
const shots = [
  {
    name: 'screen',
    hash: MAP,
    mobile: true,
    // The narrowest with the bottom bar on one line.
    viewport: { width: 820, height: 520 },
  },
  {
    name: 'map-toolbar',
    hash: MAP,
    mobile: true,
    crop: '.fm-ib-scroller-bottom .fm-toolbar',
  },
  {
    name: 'context-menu',
    hash: MAP,
    steps: async (page) => {
      // High enough for the menu to open downwards in full.
      await page.mouse.click(640, 150, { button: 'right' });
    },
    crop: '.dropdown-menu.show',
  },
  {
    name: 'search-functions',
    hash: MAP,
    mobile: true,
    steps: async (page) => {
      await page.locator('.fm-toolbar.mt-2 input').fill('export');
    },
    crop: '.fm-toolbar.mt-2, .dropdown-menu.show',
  },
  {
    name: 'route-planner-toolbar',
    hash: `map=13/48.7640/19.1900&layers=X&tools=route-planner&${ROUTE}`,
    mobile: true,
    // Only the tool taking map clicks has it; finish picking stays on.
    crop: '.fm-toolbar-map-click',
  },
  {
    name: 'route-planner-route',
    hash: `map=13/48.7640/19.1900&layers=X&tools=route-planner&${ROUTE}`,
    // The narrowest the route finder's toolbar fits in; the height keeps the
    // route and the label at its finish clear of the toolbars.
    viewport: { width: 1280, height: 760 },
  },
  {
    name: 'drawing-toolbar',
    hash: `${MAP}&tools=import-file`,
    mobile: true,
    steps: async (page) => {
      await page
        .locator('.fm-toolbar:has(#more) .dropdown-toggle')
        .first()
        .click();
    },
    crop: '.fm-toolbar:has(#more), .dropdown-menu.show',
  },
  {
    name: 'drawing-line',
    // The map's centre is west of the line, which then lies under the
    // selection toolbar, so the crop takes in nothing of the search box.
    hash: 'map=14/48.7480/19.1200&layers=X&line=48.7560/19.1250,48.7530/19.1420,48.7450/19.1500,48.7400/19.1680',
    steps: async (page) => {
      // Selects the line by a click at the middle of its path.
      const { x, y } = await page.evaluate(() => {
        const line = document.querySelector('path.leaflet-interactive');

        const p = line.getPointAtLength(line.getTotalLength() / 2);

        return new DOMPoint(p.x, p.y).matrixTransform(line.getScreenCTM());
      });

      await page.mouse.click(x, y);
    },
    crop: '.fm-toolbar-selection, path.leaflet-interactive',
  },
  {
    name: 'tracks-profile',
    hash: `map=13/48.765/19.18&layers=X&line=${TRACK_LINE}&elevation-chart=track-viewer&elevation-chart-range=4500,7000`,
    crop: '[class*="ElevationChart-module__elevation"]',
  },
  {
    name: 'tracks-export',
    hash: `map=13/48.765/19.18&layers=X&line=${TRACK_LINE}&show=map-features-export`,
    crop: '.modal-dialog',
  },
  {
    name: 'photos-toolbar',
    hash: `${MAP}~I`,
    mobile: true,
    crop: '.fm-toolbar:has(#more)',
  },
  {
    name: 'photos-viewer',
    // A Wikimedia Commons photo near Banská Bystrica; the footer captured is
    // the same for any photo, should this one go.
    hash: `${MAP}~I&show=gallery-viewer/-153579246`,
    steps: async (page) => {
      // The modal scrolls, not the page.
      await page.locator('.modal.show .modal-footer').scrollIntoViewIfNeeded();
    },
    crop: '.modal.show .modal-footer',
  },
  {
    name: 'tracking-toolbar',
    hash: `${MAP}&tools=tracking`,
    mobile: true,
    crop: '.fm-toolbar:has(#tracking_visual)',
  },
  {
    name: 'offline-new-map',
    hash: `${MAP}&show=offline-maps`,
    // The form scrolls inside the modal at 800 px.
    viewport: { width: 1280, height: 1000 },
    steps: async (page, lang) => {
      await page
        .locator('.modal-content button', {
          hasText: { en: 'Add offline map', sk: 'Pridať offline mapu' }[lang],
        })
        .click();

      // Its size estimate samples real tiles.
      await page.waitForTimeout(2000);
    },
    crop: '.modal-content',
  },
  {
    name: 'devices-open-in',
    hash: MAP,
    // The submenu is ~640 px tall.
    viewport: { width: 1280, height: 1000 },
    steps: async (page) => {
      await page.mouse.click(640, 150, { button: 'right' });

      // "Open in…" is the context menu's last item.
      await page
        .locator('.dropdown-menu.show button.dropdown-item')
        .last()
        .click();
    },
    crop: '.dropdown-menu.show',
  },
  {
    name: 'devices-garmin-export',
    hash: `${MAP}&line=48.745/19.13,48.75/19.15,48.752/19.17&show=map-features-export`,
    steps: async (page) => {
      await page.locator('label[for="garmin"]').click();
    },
    crop: '.modal-content',
  },
];

async function waitForTiles(page, label) {
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('.leaflet-tile-loaded') !== null &&
        document.querySelectorAll('.leaflet-tile:not(.leaflet-tile-loaded)')
          .length === 0,
      undefined,
      { timeout: 30_000 },
    );
  } catch {
    console.warn(`${label}: some tiles did not load`);
  }
}

async function capture(browser, shot, lang, mobile) {
  const scale = shot.scale ?? 2;

  const viewport = mobile
    ? (shot.mobileViewport ?? PHONE)
    : (shot.viewport ?? { width: 1280, height: 800 });

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    // A touch phone: the app lays itself out for one by these, not by width alone.
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: 'light',
    locale: lang,
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  const problems = [];

  page.on('pageerror', (err) => problems.push(err.message));

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      problems.push(msg.text());
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      problems.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto(`${BASE}/#${shot.hash}&lang=${lang}`);

  await page.addStyleTag({ content: mobile ? HIDE_CSS + WRAP_CSS : HIDE_CSS });

  // Fails here, not with a picture of the error page, while the server rebuilds.
  try {
    await page
      .locator('.fm-ib-scroller-bottom .fm-toolbar')
      .waitFor({ timeout: 30_000 });
  } catch (err) {
    throw new Error(
      `${shot.name}.${lang}: the app did not start\n${problems.join('\n')}`,
      { cause: err },
    );
  }

  await waitForTiles(page, `${shot.name}.${lang}`);

  await shot.steps?.(page, lang);

  await page.waitForTimeout(1000);

  let clip;

  if (shot.crop) {
    const boxes = (
      await Promise.all(
        (await page.locator(shot.crop).all()).map((l) => l.boundingBox()),
      )
    ).filter(Boolean);

    if (boxes.length === 0) {
      throw new Error(`${shot.name}: nothing matches ${shot.crop}`);
    }

    const pad = shot.pad ?? 8;

    const x = Math.max(0, Math.min(...boxes.map((b) => b.x)) - pad);
    const y = Math.max(0, Math.min(...boxes.map((b) => b.y)) - pad);

    const right = Math.min(
      viewport.width,
      Math.max(...boxes.map((b) => b.x + b.width)) + pad,
    );

    const bottom = Math.min(
      viewport.height,
      Math.max(...boxes.map((b) => b.y + b.height)) + pad,
    );

    clip = { x, y, width: right - x, height: bottom - y };
  }

  const base = `${shot.name}.${lang}${mobile ? '.mobile' : ''}`;

  const png = path.join(staging, `${base}.png`);

  await page.screenshot({ path: png, clip });

  await context.close();

  const name = `${base}.webp`;

  execFileSync('cwebp', [
    '-quiet',
    '-q',
    '85',
    png,
    '-o',
    path.join(staging, name),
  ]);

  fs.rmSync(png);

  const size = clip ?? viewport;

  manifest[name] = {
    width: Math.round(size.width),
    height: Math.round(size.height),
  };

  console.log(name);
}

const manifestPath = path.join(OUT, 'manifest.json');

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  : {};

const only = process.argv.slice(2);

// Writing into src/ makes the dev server rebuild, and a page loaded meanwhile
// asks for chunks that aren't there yet; so everything lands at the end.
const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-manual-'));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
});

try {
  for (const shot of shots) {
    if (only.length === 0 || only.includes(shot.name)) {
      for (const lang of LANGS) {
        await capture(browser, shot, lang, false);

        if (shot.mobile) {
          await capture(browser, shot, lang, true);
        }
      }
    }
  }
} finally {
  await browser.close();

  fs.mkdirSync(OUT, { recursive: true });

  for (const file of fs.readdirSync(staging)) {
    fs.copyFileSync(path.join(staging, file), path.join(OUT, file));
  }

  fs.rmSync(staging, { recursive: true });

  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      Object.fromEntries(Object.entries(manifest).toSorted()),
      null,
      2,
    )}\n`,
  );
}
