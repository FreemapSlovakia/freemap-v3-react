import type { RecorderPoint } from './protocol.js';

/**
 * Splits a flat, `seq`-ordered track into the segments it should be drawn and
 * exported as, so a restart or a long silence doesn't become a straight line
 * across the break.
 *
 * Segments are derived rather than stored: the points arrive flat because the
 * merge is by `seq`, and a cold reload refetches the whole track from the
 * recorder — but the `seg` ordinals and the timestamps still carry the breaks, so
 * the same split falls out again with nothing persisted. Changing the threshold
 * re-splits an existing track for free.
 *
 * Two rules, either of which starts a segment:
 *
 * - **`seg`** — the recorder's own ordinal, which it bumps on every start. It is
 *   the authority on where a recording was interrupted, so this app keeps no
 *   record of its own.
 * - **`gapMs`** — a silence longer than this, which is a display preference
 *   rather than a fact about the recording: a long stop inside one segment shows
 *   as a break because a straight line across it would be a lie. `0` disables it.
 */
/**
 * Whether `point` begins a new segment after `previous`. Shared with the
 * statistics, which fold over the flat track and have to break it the same way —
 * two rules that disagreed would put the distance and the drawn line at odds.
 */
export function startsNewSegment(
  previous: RecorderPoint,
  point: RecorderPoint,
  gapMs: number,
): boolean {
  return (
    point.seg !== previous.seg || (gapMs > 0 && point.ts - previous.ts > gapMs)
  );
}

export function splitPointsIntoSegments(
  points: readonly RecorderPoint[],
  gapMs: number,
): RecorderPoint[][] {
  if (points.length === 0) {
    return [];
  }

  const segments: RecorderPoint[][] = [];

  let current: RecorderPoint[] = [];

  for (const point of points) {
    const previous = current.at(-1);

    if (previous !== undefined && startsNewSegment(previous, point, gapMs)) {
      segments.push(current);

      current = [];
    }

    current.push(point);
  }

  segments.push(current);

  return segments;
}
