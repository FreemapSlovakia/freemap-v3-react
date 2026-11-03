import { clamp } from '@shared/mathUtils.js';
import { formatScaleNumber } from '../colorize.js';
import { scalarSpanColorizer } from './pathDetail.js';

// Straight at the start, down to 0.25, the floor GraphHopper stores it with.
const STRAIGHT = 1;

const WINDING = 0.25;

/** The curvature at a place on the palette, 0 to 1, and the inverse. */
const curvatureAt = (t: number) => STRAIGHT + t * (WINDING - STRAIGHT);

const curvatureColorAt = (value: number) =>
  clamp((value - STRAIGHT) / (WINDING - STRAIGHT), 0, 1);

/**
 * How winding the way is, from GraphHopper's `curvature`: beeline over length
 * per edge.
 */
export const curvatureColorizer = scalarSpanColorizer({
  detail: 'curvature',
  colorAt: curvatureColorAt,
  scale: ({ cm, language }) => ({
    // Beeline over length, read as how straight the way is.
    valueAt: (t) => formatScaleNumber(curvatureAt(t) * 100, 0, language, '%'),
    ticks: [
      { t: 0, label: cm.curvatureEnds.straight, inside: true },
      { t: 1, label: cm.curvatureEnds.winding, inside: true },
    ],
  }),
  // Most of any route is 0.8 or above, so the palette spends its colours there.
  palette: [
    { r: 59, g: 125, b: 216, t: 0.0 },
    { r: 39, g: 174, b: 96, t: 0.15 },
    { r: 241, g: 196, b: 15, t: 0.35 },
    { r: 230, g: 126, b: 34, t: 0.6 },
    { r: 192, g: 57, b: 43, t: 1.0 },
  ],
});
