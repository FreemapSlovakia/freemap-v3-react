import { distanceTo } from '@shared/geoutils.js';
import type { RecorderPoint } from './protocol.js';

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

/** Whether a segment is long enough to be drawn and handed over as a line. */
export const isRecorderLine = (segment: readonly RecorderPoint[]): boolean =>
  segment.length >= 2;

type LineLength = { count: number; last: RecorderPoint; meters: number };

// By first point: the reducer keeps point objects, so a line that only grew
// is extended rather than remeasured, and a cleared track matches nothing.
const lineLengths = new WeakMap<RecorderPoint, LineLength>();

/** A segment's length in metres. */
export function recorderLineLength(line: RecorderPoint[]): number {
  const cached = lineLengths.get(line[0]!);

  const from =
    cached && line[cached.count - 1] === cached.last
      ? cached
      : { count: 1, last: line[0]!, meters: 0 };

  let { meters, last } = from;

  for (let i = from.count; i < line.length; i++) {
    const point = line[i]!;

    meters += distanceTo(last, point);

    last = point;
  }

  lineLengths.set(line[0]!, { count: line.length, last, meters });

  return meters;
}
