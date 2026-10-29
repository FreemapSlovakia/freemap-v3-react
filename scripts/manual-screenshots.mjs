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

// The High Tatras and their valleys in the "Hypsometric tints + shading" preset.
const SHADED =
  'map=12/49.1200/20.1000&layers=h&l.h=s00000000!color-relief_0.0_5A9E5AFF_200.0_A8C878FF_500.0_E8DC96FF_1000.0_D4A868FF_1600.0_B07C54FF_2300.0_968278FF_3000.0_FFFFFFFF!hillshade-igor_135.0_1.0_000000CC';

const LAYERS_PANEL = '[class*="MapLayersPanel-module__panel"]';

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
    name: 'maps-menu',
    hash: MAP,
    mobile: true,
    // Tall enough for the whole menu to open upwards.
    viewport: { width: 1280, height: 900 },
    steps: async (page) => {
      // The map menu's toggle is the only bottom-bar button with a title.
      await page.locator('.fm-ib-scroller-bottom button[title]').click();
    },
    crop: '.fm-ib-scroller-bottom .fm-toolbar, .dropdown-menu.show',
  },
  {
    name: 'maps-layers-panel',
    hash: 'map=14/48.7483/19.1480&layers=S~xh~xc',
    mobile: true,
    steps: async (page) => {
      await page.keyboard.press('.');
    },
    crop: '[class*="MapLayersPanel-module__panel"]',
  },
  {
    name: 'maps-installed',
    hash: `${MAP}&show=installed-maps`,
    // The filter chips fill ~450 px; taller shows table rows below them.
    viewport: { width: 1280, height: 1400 },
    crop: '.modal-content',
  },
  {
    name: 'shading-map',
    hash: SHADED,
    viewport: { width: 820, height: 520 },
  },
  {
    name: 'shading-panel',
    hash: SHADED,
    mobile: true,
    // Tall enough for the selected layer's settings down to its colour.
    viewport: { width: 1280, height: 1200 },
    mobileViewport: { width: 390, height: 1100 },
    steps: async (page) => {
      // A lone base map's panel opens straight on its settings.
      await page.keyboard.press('.');

      const items = page.locator(`${LAYERS_PANEL} .list-group-item`);

      await items.first().waitFor();

      await items.last().click();
    },
    crop: LAYERS_PANEL,
  },
  {
    name: 'shading-presets',
    hash: SHADED,
    // The presets menu runs down past 1200 px.
    viewport: { width: 1280, height: 1500 },
    steps: async (page) => {
      await page.keyboard.press('.');

      await page
        .locator(`${LAYERS_PANEL} .dropdown.ms-auto > .dropdown-toggle`)
        .click();
    },
    crop: `${LAYERS_PANEL}, .dropdown-menu.show`,
  },
  {
    name: 'custom-maps-form',
    hash: `${MAP}&show=installed-maps`,
    // The whole form fits without scrolling inside the modal.
    viewport: { width: 1280, height: 1000 },
    steps: async (page, lang) => {
      await page
        .locator('.modal-content button', {
          hasText: { en: 'New custom map', sk: 'Nová vlastná mapa' }[lang],
        })
        .click();

      await page.locator('.modal-content input#name').fill('OpenTopoMap');

      await page
        .locator('.modal-content input#url')
        .fill('https://tile.opentopomap.org/{z}/{x}/{y}.png');
    },
    crop: '.modal-content',
  },
  {
    name: 'weather-radar-toolbar',
    hash: 'map=8/48.7483/19.1480&layers=X~R',
    mobile: true,
    steps: async (page) => {
      // The slider renders once the frame list has loaded.
      await page.waitForSelector('.fm-toolbar:has(input[type=range])');
    },
    crop: '.fm-toolbar:has(input[type=range])',
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
