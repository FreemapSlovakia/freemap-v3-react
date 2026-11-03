import { clamp } from '@shared/mathUtils.js';
import { formatScaleNumber, type HotlinePalette } from '../colorize.js';
import { scalarSpanColorizer } from './pathDetail.js';

/** What GraphHopper reports for no limit at all, such as an unrestricted Autobahn. */
export const NO_SPEED_LIMIT = 150;

/** The fastest real limit the ramp reaches (Poland's and Bulgaria's motorways). */
const RAMP_TOP = 140;

/** Where the ramp ends and the band for no limit begins. */
const RAMP_END = 0.9;

const NO_LIMIT_COLOR = { r: 125, g: 60, b: 152 };

/** Where a limit sits on the palette, 0 to 1. */
export function maxSpeedColorAt(value: number): number {
  return value >= NO_SPEED_LIMIT
    ? (RAMP_END + 1) / 2
    : (clamp(value, 0, RAMP_TOP) / RAMP_TOP) * RAMP_END;
}

/** The limit at a place on the palette; `Infinity` in the band for no limit. */
export function maxSpeedAt(t: number): number {
  return t > RAMP_END ? Infinity : (t / RAMP_END) * RAMP_TOP;
}

// Calm to fast; the two stops at `RAMP_END` make the step to no limit hard.
const palette: HotlinePalette = [
  { r: 59, g: 125, b: 216, t: maxSpeedColorAt(0) },
  { r: 39, g: 174, b: 96, t: maxSpeedColorAt(30) },
  { r: 241, g: 196, b: 15, t: maxSpeedColorAt(60) },
  { r: 230, g: 126, b: 34, t: maxSpeedColorAt(90) },
  { r: 192, g: 57, b: 43, t: maxSpeedColorAt(130) },
  { r: 140, g: 30, b: 30, t: RAMP_END },
  { ...NO_LIMIT_COLOR, t: RAMP_END },
  { ...NO_LIMIT_COLOR, t: 1 },
];

/**
 * The legal speed limit, from `max_speed` (km/h), on one scale for every route.
 * The server fills untagged ways from country defaults, so a forest path reads
 * as the rural limit.
 */
export const maxSpeedColorizer = scalarSpanColorizer({
  detail: 'max_speed',
  palette,
  colorAt: maxSpeedColorAt,
  scale: ({ language }) => ({
    unit: 'km/h',
    wide: true,
    valueAt: (t) => {
      const v = maxSpeedAt(t);

      return Number.isFinite(v)
        ? formatScaleNumber(v, 0, language, 'km/h')
        : '∞';
    },
    ticks: [
      ...[10, 30, 50, 70, 90, 110, 130].map((v) => ({
        t: maxSpeedColorAt(v),
        label: `${v}`,
      })),
      { t: maxSpeedColorAt(NO_SPEED_LIMIT), label: '∞' },
    ],
  }),
});
