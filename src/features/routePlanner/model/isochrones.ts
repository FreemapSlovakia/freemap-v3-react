import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import type { Feature, Polygon } from 'geojson';
import type { IsochroneParams } from './actions.js';

// Isochrone bucket colors, shared by the map rendering and the exports so an
// exported isochrone looks like the one on screen. Index 0 is the outermost
// (widest) bucket; inner buckets get progressively warmer.
export const ISOCHRONE_COLORS = [
  '#3388ff',
  '#5f6fc8',
  '#8b5692',
  '#b73d5b',
  '#e32525',
];

/** Fill opacity of the outermost bucket; the inner ones are outlines only. */
export const ISOCHRONE_FILL_OPACITY = 0.15;

/** Color of the `bucket`-th of `count` isochrone rings. */
export function isochroneColor(bucket: number, count: number): string {
  return ISOCHRONE_COLORS[count - bucket - 1] ?? ISOCHRONE_COLORS[0];
}

/** How far a ring reaches: seconds when `time`, metres when `distance`. */
export type IsochroneLimit = { type: 'time' | 'distance'; value: number };

// Feature properties carrying the limit, written when the response is parsed.
// GraphHopper itself returns only a `bucket` index, and the request parameters
// can be edited (or fail to fetch) while an older result is still on screen —
// so each ring records what it actually reached.
const LIMIT = 'fm:limit';
const LIMIT_TYPE = 'fm:limitType';

/**
 * Labels each returned ring with the limit it reaches. GraphHopper divides the
 * requested limit evenly among the buckets, innermost first, and honours
 * `distanceLimit` in place of `timeLimit` whenever it is set.
 */
export function withIsochroneLimits(
  polygons: Feature<Polygon>[],
  { timeLimit, distanceLimit }: IsochroneParams,
): Feature<Polygon>[] {
  const type = distanceLimit ? 'distance' : 'time';

  const limit = distanceLimit || timeLimit;

  return polygons.map((polygon, i) => {
    const bucket = polygon.properties?.['bucket'] ?? i;

    return {
      ...polygon,
      properties: {
        ...polygon.properties,
        // The response's own bucket count, not the requested one — the router
        // clamps the request, so this is what was actually divided.
        [LIMIT]: (limit * (bucket + 1)) / polygons.length,
        [LIMIT_TYPE]: type,
      },
    };
  });
}

/** The limit a ring reaches, or undefined if it carries none. */
export function isochroneLimit(
  polygon: Feature<Polygon>,
): IsochroneLimit | undefined {
  const value = polygon.properties?.[LIMIT];

  const type = polygon.properties?.[LIMIT_TYPE];

  return typeof value === 'number' && (type === 'time' || type === 'distance')
    ? { type, value }
    : undefined;
}

/**
 * A ring's name for a drawing polygon or an export feature: the reachability
 * limit it stands for, e.g. `Isochrone 30 min` or `Isochrone 5.0 km`. Falls
 * back to the 1-based bucket number for a ring with no recorded limit.
 */
export function isochroneLabel(
  polygon: Feature<Polygon>,
  bucket: number,
  isochroneRing: string,
  language: string,
): string {
  const limit = isochroneLimit(polygon);

  return `${isochroneRing} ${
    !limit
      ? `#${bucket + 1}`
      : limit.type === 'distance'
        ? formatDistance(limit.value, language)
        : formatDuration(limit.value, language)
  }`;
}
