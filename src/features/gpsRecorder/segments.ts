import type { RecorderPoint } from './protocol.js';

/**
 * Splits a flat, `seq`-ordered track into the segments it should be drawn and
 * exported as, so a pause, a restart or a long silence doesn't become a
 * straight line across the break.
 *
 * Segments are derived rather than stored: the points arrive flat because the
 * merge is by `seq`, and a cold reload refetches the whole track from the
 * recorder — but the timestamps still carry the gaps, so the same split falls
 * out again with nothing persisted. Changing the threshold re-splits an
 * existing track for free.
 *
 * Three rules, any of which starts a segment:
 *
 * - **`seg`** — the recorder's own ordinal, authoritative when it sends one.
 * - **`breakAfter`** — seqs this app recorded when it paused or stopped, which
 *   catches a pause too short for the time rule to see.
 * - **`gapMs`** — a silence longer than this, which catches a recording stopped
 *   and restarted from the recorder's own UI or from another page. `0` disables
 *   it.
 */
export function splitPointsIntoSegments(
  points: readonly RecorderPoint[],
  breakAfter: readonly number[],
  gapMs: number,
): RecorderPoint[][] {
  if (points.length === 0) {
    return [];
  }

  const breaks = new Set(breakAfter);

  const segments: RecorderPoint[][] = [];

  let current: RecorderPoint[] = [];

  for (const point of points) {
    const previous = current.at(-1);

    const startsSegment =
      previous !== undefined &&
      (breaks.has(previous.seq) ||
        (previous.seg !== null &&
          point.seg !== null &&
          point.seg !== previous.seg) ||
        (gapMs > 0 && point.ts - previous.ts > gapMs));

    if (startsSegment) {
      segments.push(current);

      current = [];
    }

    current.push(point);
  }

  segments.push(current);

  return segments;
}

/**
 * Drops fixes too imprecise to be worth keeping. Applied to the geometry, the
 * statistics and the saved track alike — a filter that only hid points on the
 * map would leave the readout and the exported file disagreeing with it.
 *
 * Only used when the recorder isn't filtering already (its `config.maxAccuracyM`
 * says it is), so a fix is never discarded twice under two different limits.
 */
export function filterByAccuracy(
  points: readonly RecorderPoint[],
  maxAccuracyM: number | null,
): readonly RecorderPoint[] {
  return maxAccuracyM === null
    ? points
    : points.filter((point) => point.acc === null || point.acc <= maxAccuracyM);
}
