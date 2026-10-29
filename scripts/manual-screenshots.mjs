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

// Toasts (attribution, cookie consent) would land in every shot. Dev-server
// CSS module names carry the module path.
const HIDE_CSS =
  '[class*="Toasts-module__toasts"] { display: none !important; }';

/**
 * `crop` is a selector (the union of what it matches, plus `pad` CSS px of
 * the map around it, 8 unless set, as far as the viewport goes);
 * without it the whole `viewport` is taken. `steps` runs before the capture.
 */
const shots = [
  {
    name: 'screen',
    hash: MAP,
    // The narrowest with the bottom bar on one line.
    viewport: { width: 820, height: 520 },
  },
  {
    name: 'map-toolbar',
    hash: MAP,
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
    steps: async (page) => {
      await page.locator('.fm-toolbar.mt-2 input').fill('export');
    },
    crop: '.fm-toolbar.mt-2, .dropdown-menu.show',
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

async function capture(browser, shot, lang) {
  const scale = shot.scale ?? 2;

  const viewport = shot.viewport ?? { width: 1280, height: 800 };

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
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

  await page.addStyleTag({ content: HIDE_CSS });

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

  const png = path.join(staging, `${shot.name}.${lang}.png`);

  await page.screenshot({ path: png, clip });

  await context.close();

  const name = `${shot.name}.${lang}.webp`;

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
        await capture(browser, shot, lang);
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
