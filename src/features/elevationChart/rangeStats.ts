import type { ChartRange, ElevationProfilePoint } from './model/reducer.js';
import { profilePointAtDistance, profileSlice } from './profilePoint.js';

/** What a marked-out stretch of the profile adds up to. */
export interface RangeStats {
  length: number;
  up: number;
  down: number;
  /** The elevations it runs between; `NaN` where it holds none at all. */
  min: number;
  max: number;
  /** Rise over run end to end, as a ratio; `NaN` for a stretch of no length. */
  grade: number;
}

/**
 * The figures for `range`. The climb totals are cumulative along the profile,
 * so the stretch's own are the difference between its ends — which also keeps
 * them agreeing with the whole line's. `null` where there is nothing to measure.
 */
export function rangeStatsOf(
  points: ElevationProfilePoint[],
  range: ChartRange | null,
): RangeStats | null {
  if (!range) {
    return null;
  }

  const a = profilePointAtDistance(points, range.from);

  const b = profilePointAtDistance(points, range.to);

  if (!a || !b) {
    return null;
  }

  let min = Number.POSITIVE_INFINITY;

  let max = Number.NEGATIVE_INFINITY;

  for (const { ele } of profileSlice(points, range.from, range.to)) {
    if (Number.isFinite(ele)) {
      min = Math.min(min, ele);

      max = Math.max(max, ele);
    }
  }

  const length = range.to - range.from;

  return {
    length,
    up: (b.climbUp ?? 0) - (a.climbUp ?? 0),
    down: (b.climbDown ?? 0) - (a.climbDown ?? 0),
    // Not the infinities the running comparisons start at, which a reader that
    // forgot to check would print as such.
    min: min <= max ? min : Number.NaN,
    max: min <= max ? max : Number.NaN,
    // Straight from end to end, which is what a stretch's steepness means — not
    // the average of the wiggles inside it.
    grade: length > 0 ? (b.ele - a.ele) / length : Number.NaN,
  };
}
