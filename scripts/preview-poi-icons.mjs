// Renders a contact sheet of poi icons to /tmp/poi-icons.png — a light row over
// a dark one — so a borrowed or re-painted icon can be judged before it ships.
//
// Run: node scripts/preview-poi-icons.mjs <icon> [label=<icon> …]
//   e.g. node scripts/preview-poi-icons.mjs spring 'blacksmith=temaki:anvil_and_hammer'
//
// The placement mirrors poiIconGlyphRect, and the halo mirrors the dark-theme
// rule in IconGlyph.module.css, so what comes out is what the app draws.

import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { POI_ICON_KNOCKOUT_VAR, poiIcons } from '../src/osm/poiIcons.ts';

const OUT_FILE = join(tmpdir(), 'poi-icons.png');

const COLS = 8;
const CELL = 54;
const GLYPH = 30;
const LABEL = 13;
const ROW = CELL + LABEL;

// MARKER_VIEWBOX_WIDTH / MARKER_REF_WIDTH, brought down to this sheet's glyph
// box the way RichMarker's GLYPH_SIZE is (see poiIconGlyph.ts).
const NATURAL = (310 / 24) * (GLYPH / 160);

const THEMES = [
  { bg: '#ffffff', ink: '#212529', halo: false },
  { bg: '#212529', ink: '#dee2e6', halo: true },
];

const pairs = process.argv
  .slice(2)
  .map((arg) => (arg.includes('=') ? arg.split(/=(.*)/) : [arg, arg]));

const unknown = pairs.filter(([, name]) => !poiIcons[name]);

if (unknown.length) {
  console.error(`no such icon: ${unknown.map(([, n]) => n).join(', ')}`);

  process.exitCode = 1;
}

const known = pairs.filter(([, name]) => poiIcons[name]);

if (!known.length) {
  console.error('nothing to render');

  process.exit(1);
}

function glyph(name, x, y, theme) {
  const icon = poiIcons[name];

  const [lx, ly, bw, bh] = icon.bbox;
  const [, , vbW, vbH] = icon.vb;

  const scale = Math.min(NATURAL * (icon.ppu ?? 1), GLYPH / Math.max(bw, bh));

  const el =
    `<svg x="${x + CELL / 2 - (lx + bw / 2) * scale}" ` +
    `y="${y + CELL / 2 - (ly + bh / 2) * scale}" ` +
    `width="${vbW * scale}" height="${vbH * scale}" ` +
    `viewBox="${icon.vb.join(' ')}" fill="${theme.ink}" color="${theme.ink}">` +
    icon.body.replaceAll(`var(${POI_ICON_KNOCKOUT_VAR}, #fff)`, theme.bg) +
    `</svg>`;

  // Only the icons with colours of their own get the halo, and only on dark.
  return icon.mono || !theme.halo ? el : `<g filter="url(#halo)">${el}</g>`;
}

const rows = Math.ceil(known.length / COLS);
const width = COLS * CELL;
const height = rows * ROW * THEMES.length;

let body = '';

THEMES.forEach((theme, t) => {
  const top = t * rows * ROW;

  body += `<rect y="${top}" width="${width}" height="${rows * ROW}" fill="${theme.bg}"/>`;

  known.forEach(([label, name], i) => {
    const x = (i % COLS) * CELL;
    const y = top + Math.floor(i / COLS) * ROW;

    body +=
      glyph(name, x, y, theme) +
      `<text x="${x + CELL / 2}" y="${y + CELL + 8}" text-anchor="middle" ` +
      `font-family="sans-serif" font-size="6.5" fill="${theme.ink}">` +
      label.replace(/[<&]/g, '').slice(0, 16) +
      `</text>`;
  });
});

const halo =
  `<filter id="halo" x="-30%" y="-30%" width="160%" height="160%">` +
  `<feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="${THEMES[1].ink}" flood-opacity="1"/>`.repeat(
    3,
  ) +
  `</filter>`;

writeFileSync(
  OUT_FILE,
  new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
      `viewBox="0 0 ${width} ${height}">${halo}${body}</svg>`,
    { fitTo: { mode: 'zoom', value: 3 } },
  )
    .render()
    .asPng(),
);

console.log(`Wrote ${OUT_FILE}: ${known.length} icons.`);
