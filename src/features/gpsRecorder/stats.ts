import { distance } from '@turf/distance';
import type { RecorderPoint } from './protocol.js';

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
 * Track statistics for the live readout, computed per segment so a pause
 * contributes neither the straight-line distance across it nor its own
 * duration.
 *
 * Ascent uses the same threshold-and-carry filter a barometric altimeter would:
 * a climb only counts once it has exceeded the noise floor since the last
 * counted point, which keeps the number stable as fixes arrive.
 */
export function computeRecorderStats(
  segments: readonly (readonly RecorderPoint[])[],
): RecorderStats {
  let total = 0;

  let recordedDuration = 0;

  let ascent = 0;

  let points = 0;

  let first: RecorderPoint | undefined;

  let last: RecorderPoint | undefined;

  for (const segment of segments) {
    points += segment.length;

    if (segment.length === 0) {
      continue;
    }

    first ??= segment[0];

    last = segment.at(-1);

    recordedDuration += segment.at(-1)!.ts - segment[0]!.ts;

    // The last altitude the ascent has been counted up to; a rise is only
    // credited once it clears the noise floor above it.
    let reference: number | null = null;

    for (let i = 0; i < segment.length; i++) {
      const point = segment[i]!;

      if (i > 0) {
        const previous = segment[i - 1]!;

        total += distance(
          [previous.lon, previous.lat],
          [point.lon, point.lat],
          { units: 'meters' },
        );
      }

      if (point.alt === null) {
        continue;
      }

      if (reference === null) {
        reference = point.alt;
      } else if (point.alt - reference > ASCENT_THRESHOLD_M) {
        ascent += point.alt - reference;

        reference = point.alt;
      } else if (point.alt < reference) {
        reference = point.alt;
      }
    }
  }

  return {
    distance: total,
    duration: first && last ? last.ts - first.ts : 0,
    recordedDuration,
    ascent,
    speed: last?.spd ?? null,
    averageSpeed:
      recordedDuration > 0 ? total / (recordedDuration / 1000) : null,
    points,
    segments: segments.length,
  };
}
