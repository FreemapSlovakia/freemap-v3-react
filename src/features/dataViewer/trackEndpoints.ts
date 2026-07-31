import { lineSegments, trackTimeSegments } from '@shared/geoutils.js';
import { length as turfLength } from '@turf/length';
import type { Feature, Position } from 'geojson';
import type { TrackLine } from './trackSelection.js';

export interface TrackEndpoints {
  start: Position;
  finish: Position;
  startTime?: Date;
  finishTime?: Date;
  /** Total length in metres, summed across segments (gaps excluded). */
  length: number;
}

// The very first and very last recorded timestamps of a track.
function endpointTimes(feature: Feature): [Date | undefined, Date | undefined] {
  const segments = trackTimeSegments(feature);

  const toDate = (v: unknown) => {
    if (typeof v !== 'string') {
      return undefined;
    }

    const d = new Date(v);

    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  return [toDate(segments[0]?.[0]), toDate(segments.at(-1)?.at(-1))];
}

/**
 * Start/finish coordinates, endpoint times and total length of a line-like
 * track. A multi-segment recording is treated as one track: start is the first
 * vertex of the first segment, finish the last vertex of the last segment, and
 * the length is summed across segments (the inter-segment gap doesn't count).
 * Returns `undefined` when there are no coordinates.
 */
export function trackEndpoints(feature: TrackLine): TrackEndpoints | undefined {
  const segments = lineSegments(feature.geometry).filter(
    (segment) => segment.length > 0,
  );

  const start = segments[0]?.[0];

  const finish = segments.at(-1)?.at(-1);

  if (!start || !finish) {
    return undefined;
  }

  const [startTime, finishTime] = endpointTimes(feature);

  return {
    start,
    finish,
    startTime,
    finishTime,
    length: turfLength(feature, { units: 'meters' }),
  };
}
