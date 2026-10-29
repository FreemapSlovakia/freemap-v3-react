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

// From Kráľova hoľa to 20 km; the link computes the viewshed on arrival.
const VIEWSHED =
  'map=10/48.8828/20.1393&layers=X~v&viewshed=48.8828,20.1393,20';

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
    name: 'panorama-panel',
    // Slavkovský štít, looking north over the High Tatras.
    hash: 'map=12/49.17/20.10&layers=X&tools=panorama',
    steps: async (page) => {
      // A render starts only on an act, not with the page: the viewpoint goes in
      // after start-up.
      await page.evaluate(() => {
        location.hash =
          'map=12/49.17/20.10&layers=X&tools=panorama&panorama=49.1666,20.1841';
      });

      await page.waitForSelector('[class*="Panorama-module"] canvas', {
        timeout: 90_000,
      });

      await page.waitForFunction(
        () => !document.querySelector('.spinner-border'),
        undefined,
        { timeout: 90_000 },
      );

      await page.getByText('Ľadový štít', { exact: true }).first().click();

      await page.waitForTimeout(1500);
    },
    crop: '[class*="FloatingWindow-module__window"], .leaflet-marker-icon',
  },
  {
    name: 'viewshed-map',
    hash: VIEWSHED,
    mobile: true,
    viewport: { width: 820, height: 520 },
    steps: async (page) => {
      // Computed on the terrain server.
      await page.waitForSelector('img.leaflet-image-layer', {
        timeout: 120_000,
      });

      await page.waitForTimeout(1500);
    },
  },
  {
    name: 'viewshed-toolbar',
    hash: VIEWSHED,
    mobile: true,
    steps: async (page) => {
      await page.waitForSelector('img.leaflet-image-layer', {
        timeout: 120_000,
      });

      // Range and detail; amber without premium, which every shot is.
      await page.locator('.fm-dropdown-toggle-nocaret.text-warning').click();

      // Away from the toggle, whose tooltip would cover the menu.
      await page.mouse.move(5, 700);

      await page.waitForTimeout(800);
    },
    crop: '.fm-toolbar:has(.fm-dropdown-toggle-nocaret.text-warning), .dropdown-menu.show',
  },
  {
    name: 'toposcope-dial',
    // A centre at Banská Bystrica with rays to five summits.
    hash: 'map=10/48.78/19.40&layers=X&tools=toposcope&point=48.738/19.158%1EL%7Blocation%7D%1EIpoi%3Aviewpoint%1EPtoposcope%1Fcenter&point=48.8828/20.1394%1ELKr%C3%A1%C4%BEova%20ho%C4%BEa&point=48.9378/19.6364%1EL%C4%8Eumbier&point=49.1906/19.0314%1ELVe%C4%BEk%C3%BD%20Kriv%C3%A1%C5%88&point=48.4024/18.8778%1ELSitno&point=48.6353/19.4825%1ELPo%C4%BEana',
    // Tall enough for the square panel to open at 500 px.
    viewport: { width: 1280, height: 1000 },
    crop: '[class*="Toposcope-module__toposcope"]',
  },
  {
    name: 'map-export-dialog',
    hash: `map=13/48.765/19.18&layers=X&line=${TRACK_LINE}&show=map-to-document-export`,
    // The whole form: the scrollable modal is ~1580 px tall.
    viewport: { width: 1280, height: 1660 },
    // Not `.modal-dialog`, which a scrollable modal stretches to the viewport.
    crop: '.modal-content',
  },
  {
    name: 'map-export-ready',
    hash: `map=13/48.765/19.18&layers=X&line=${TRACK_LINE}&show=map-to-document-export`,
    steps: async (page) => {
      await page.locator('.modal-footer button.btn-primary').first().click();

      // The result's Save split button; a render takes a while.
      await page
        .locator('.modal-footer .dropdown-toggle')
        .waitFor({ timeout: 120_000 });
    },
    crop: '.modal-content',
  },
  {
    name: 'objects-search',
    hash: MAP,
    mobile: true,
    steps: async (page, lang) => {
      await page
        .locator('.fm-toolbar.mt-2 input')
        .fill(lang === 'sk' ? 'prameň' : 'spring');
    },
    crop: '.fm-toolbar.mt-2, .dropdown-menu.show',
  },
  {
    name: 'objects-details',
    // Peaks around Chopok; the first marker is Prašivá, with prominence and key col.
    hash: 'map=14/48.9380/19.5800&layers=X&objects=natural=peak',
    steps: async (page) => {
      // The details popup is a toast: shown, while the others stay hidden.
      await page.addStyleTag({
        content:
          '[class*="Toasts-module__toasts"] { display: flex !important; } [class*="Toast-module__toast"]:not(:has(.lead)) { display: none !important; }',
      });

      await page.locator('.leaflet-marker-icon').first().click();

      await page.locator('[class*="Toast-module__toast"]:has(.lead)').waitFor();
    },
    crop: '[class*="Toast-module__toast"]:has(.lead)',
  },
  {
    name: 'map-details-results',
    hash: 'map=17/48.7360/19.1460&layers=X&tools=map-details',
    mobile: true,
    // The list holds ~40 rows; a lower viewport keeps the crop shorter.
    viewport: { width: 1280, height: 700 },
    steps: async (page) => {
      // Near Námestie SNP in Banská Bystrica, in the middle on a phone too.
      await page.mouse.click(page.viewportSize().width / 2, 400);

      await page.locator('.dropdown-menu.show .dropdown-item').nth(5).waitFor();
    },
    crop: '.fm-toolbar.mt-2, .dropdown-menu.show',
  },
  {
    name: 'map-details-selected',
    hash: 'map=17/48.7360/19.1460&layers=X&tools=map-details',
    viewport: { width: 1280, height: 760 },
    steps: async (page) => {
      await page.mouse.click(640, 400);

      // Its name is Slovak in either language.
      await page
        .locator('.dropdown-menu.show .dropdown-item', { hasText: 'Katedrála' })
        .click();

      // The map moves to it and its details open.
      await page.waitForTimeout(3000);
    },
  },
  {
    name: 'changesets-toolbar',
    hash: `${MAP}&tools=changesets`,
    mobile: true,
    crop: '.fm-toolbar:has(#days)',
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
