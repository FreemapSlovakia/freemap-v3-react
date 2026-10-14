// The gradient colorize modes' curves, shared by the tile renderer (which
// paints the marbles) and the legend (which labels and reads them).
import { clamp, mod } from '@shared/mathUtils.js';
import color from 'color';

const DAY_S = 24 * 60 * 60;

/** The year an age is counted in, in seconds. */
export const AGE_YEAR_S = 365 * DAY_S;

/** Where an age in years sits on the date scale: 0 now, towards 1 long ago. */
export const ageT = (years: number) => (0.333 * years) / (1 + 0.333 * years);

/** The age in years at a place on the date scale. */
export const ageYearsAt = (t: number) => t / (0.333 * (1 - t));

/** The date scale's colour at a place on it. */
export const ageColor = (t: number) => color.hsl(60, 100, 100 - 100 * t).hex();

/** A rating's colour; the scale is linear in the rating, the colour is not. */
export const ratingColor = (rating: number) =>
  color.hsv(60, 100, (Math.tanh(rating - 2.5) + 1) * 50).hex();

type Lab = [number, number, number];

/** Winter, spring, summer and fall, a quarter of the season wheel apart. */
const SEASON_STOPS: Lab[] = [
  [70, -5, -52],
  [70, -62, 42],
  [90, -4, 74],
  [70, 48, 43],
];

/** When in the year the wheel starts, at winter's colour, in seconds. */
export const SEASON_START_S = 1_206_000;

const SEASON_YEAR_S = 31_557_600;

/** The wheel spans this many days, a little more than the year it wraps on. */
const SEASON_WHEEL_DAYS = 366;

/** Where a time, in seconds since the epoch, sits on the season wheel, 0 to 1. */
export const seasonT = (time: number) =>
  mod(time - SEASON_START_S, SEASON_YEAR_S) / DAY_S / SEASON_WHEEL_DAYS;

/** The time of year at a place on the wheel, in seconds after its start. */
export const seasonOffsetAt = (t: number) => t * SEASON_WHEEL_DAYS * DAY_S;

/** The wheel's colour at a place on it. */
export function seasonColor(t: number): string {
  const q = clamp(t * 4, 0, 3.999999);

  const i = Math.floor(q);

  const n = q - i;

  const from = SEASON_STOPS[i]!;

  const to = SEASON_STOPS[(i + 1) % 4]!;

  return color
    .lab(...[0, 1, 2].map((k) => from[k]! * (1 - n) + to[k]! * n))
    .hex();
}
