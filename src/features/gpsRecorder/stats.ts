import { distance } from '@turf/distance';
import type { RecorderPoint } from './protocol.js';
import { startsNewSegment } from './segments.js';

export interface RecorderStats {
  /** Metres along the ground, summed within segments — never across a break. */
  distance: number;
  /** Milliseconds from the first fix to the last, breaks included. */
  duration: number;
  /** Milliseconds actually spent recording, i.e. duration less the breaks. */
  recordedDuration: number;
  /** Metres climbed, from the fixes that carried an altitude. */
  ascent: number;
  /** Ground speed of the newest fix in m/s, or null when it reported none. */
  speed: number | null;
  /** Mean speed over the recorded time, m/s; null before there is any. */
  averageSpeed: number | null;
  points: number;
  segments: number;
}

/**
 * Rise below this is noise, not climb: consumer GPS altitude wanders by several
 * metres while standing still, and summing every upward step would report a
 * few hundred metres of ascent for a flat ride.
 */
const ASCENT_THRESHOLD_M = 5;

/**
 * Running state of the statistics, carried between fixes so each one costs the
 * work of one point rather than of the whole track.
 *
 * Every figure in {@link RecorderStats} is a sum or a property of the newest
 * point, so all of them can be advanced a point at a time. That matters because
 * the readout is recomputed on every fix: folding the whole track each time is
 * quadratic over a session, and a haversine per pair per second is the first
 * thing a long recording would feel.
 */
export interface RecorderStatsFold {
  /** The gap threshold this was folded under; changing it re-splits the track. */
  gapMs: number;
  /** Points folded so far, i.e. the index the next one continues from. */
  count: number;
  /** `seq` of the last folded point, to prove the track still starts the same way. */
  lastSeq: number;
  distance: number;
  recordedDuration: number;
  ascent: number;
  segments: number;
  /** `ts` of the very first point, for the wall-clock duration. */
  firstTs: number;
  /** The newest folded point: the next one's predecessor, and the speed source. */
  last: RecorderPoint | null;
  /** Altitude the ascent has been credited up to; reset at each segment. */
  reference: number | null;
}

function freshFold(gapMs: number): RecorderStatsFold {
  return {
    gapMs,
    count: 0,
    lastSeq: -1,
    distance: 0,
    recordedDuration: 0,
    ascent: 0,
    segments: 0,
    firstTs: 0,
    last: null,
    reference: null,
  };
}

/**
 * Whether `fold` can be continued for `points` rather than restarted: the same
 * threshold, and a track that still begins with everything already folded.
 *
 * The track normally only grows, but `mergePoints` also fills gaps below the
 * cursor when a catch-up and the stream overlap, and a `DELETE /track` empties it
 * — so the prefix is checked rather than assumed.
 */
function continues(
  fold: RecorderStatsFold,
  points: readonly RecorderPoint[],
  gapMs: number,
): boolean {
  return (
    fold.gapMs === gapMs &&
    points.length >= fold.count &&
    (fold.count === 0 || points[fold.count - 1]?.seq === fold.lastSeq)
  );
}

/** Whether `fold` already accounts for exactly `points`, so there is nothing to do. */
export function isFoldCurrent(
  fold: RecorderStatsFold,
  points: readonly RecorderPoint[],
  gapMs: number,
): boolean {
  return fold.count === points.length && continues(fold, points, gapMs);
}

/**
 * Advances `previous` over whatever `points` has gained, or folds from scratch
 * when it cannot be continued. Never mutates what it was given.
 *
 * Ascent uses the same threshold-and-carry filter a barometric altimeter would:
 * a climb only counts once it has exceeded the noise floor since the last
 * counted point, which keeps the number stable as fixes arrive.
 */
export function foldRecorderStats(
  previous: RecorderStatsFold | null,
  points: readonly RecorderPoint[],
  gapMs: number,
): RecorderStatsFold {
  const fold =
    previous !== null && continues(previous, points, gapMs)
      ? { ...previous }
      : freshFold(gapMs);

  for (let i = fold.count; i < points.length; i++) {
    const point = points[i]!;

    const previousPoint = fold.last;

    if (previousPoint === null) {
      fold.firstTs = point.ts;

      fold.segments = 1;
    } else if (startsNewSegment(previousPoint, point, gapMs)) {
      fold.segments++;

      // A break contributes neither the straight line across it nor its own
      // duration, and the climb is measured afresh on the far side of it.
      fold.reference = null;
    } else {
      fold.recordedDuration += point.ts - previousPoint.ts;

      fold.distance += distance(
        [previousPoint.lon, previousPoint.lat],
        [point.lon, point.lat],
        { units: 'meters' },
      );
    }

    if (point.alt !== null) {
      if (fold.reference === null) {
        fold.reference = point.alt;
      } else if (point.alt - fold.reference > ASCENT_THRESHOLD_M) {
        fold.ascent += point.alt - fold.reference;

        fold.reference = point.alt;
      } else if (point.alt < fold.reference) {
        fold.reference = point.alt;
      }
    }

    fold.last = point;

    fold.count = i + 1;

    fold.lastSeq = point.seq;
  }

  return fold;
}

/** The readable statistics behind a fold. */
export function recorderStatsOf(fold: RecorderStatsFold): RecorderStats {
  return {
    distance: fold.distance,
    duration: fold.last === null ? 0 : fold.last.ts - fold.firstTs,
    recordedDuration: fold.recordedDuration,
    ascent: fold.ascent,
    speed: fold.last?.spd ?? null,
    averageSpeed:
      fold.recordedDuration > 0
        ? fold.distance / (fold.recordedDuration / 1000)
        : null,
    points: fold.count,
    segments: fold.segments,
  };
}

/** One-shot statistics for a whole track; the incremental path is the fold above. */
export function computeRecorderStats(
  points: readonly RecorderPoint[],
  gapMs: number,
): RecorderStats {
  return recorderStatsOf(foldRecorderStats(null, points, gapMs));
}
