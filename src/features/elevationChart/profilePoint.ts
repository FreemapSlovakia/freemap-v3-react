import { lowerBound } from '@shared/geoutils.js';
import type { ElevationProfilePoint } from './model/reducer.js';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * The point `t` of the way from `a` to `b`, both of them the profile's own.
 * Elevation and the climb totals are interpolated only where both ends have
 * them: across a gap there is nothing to interpolate, so the nearer end's value
 * stands — the same value hovering that end would have shown.
 */
function between(
  a: ElevationProfilePoint,
  b: ElevationProfilePoint,
  t: number,
): ElevationProfilePoint {
  const near = t < 0.5 ? a : b;

  return {
    lat: lerp(a.lat, b.lat, t),
    lon: lerp(a.lon, b.lon, t),
    distance: lerp(a.distance, b.distance, t),
    ele:
      Number.isFinite(a.ele) && Number.isFinite(b.ele)
        ? lerp(a.ele, b.ele, t)
        : near.ele,
    climbUp:
      typeof a.climbUp === 'number' && typeof b.climbUp === 'number'
        ? lerp(a.climbUp, b.climbUp, t)
        : near.climbUp,
    climbDown:
      typeof a.climbDown === 'number' && typeof b.climbDown === 'number'
        ? lerp(a.climbDown, b.climbDown, t)
        : near.climbDown,
  };
}

/**
 * The point that far along the profile, interpolated between the two samples it
 * falls between so a readout follows the pointer instead of snapping from one
 * sample to the next. Clamped to the profile's ends; `undefined` on an empty
 * one. The distance axis is non-decreasing, so the pair is found by bisection.
 */
export function profilePointAtDistance(
  points: ElevationProfilePoint[],
  distance: number,
): ElevationProfilePoint | undefined {
  if (points.length === 0) {
    return undefined;
  }

  if (distance <= points[0]!.distance) {
    return points[0];
  }

  let hi = points.length - 1;

  if (distance >= points[hi]!.distance) {
    return points[hi];
  }

  let lo = 0;

  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;

    if (points[mid]!.distance <= distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const a = points[lo]!;

  const b = points[hi]!;

  const span = b.distance - a.distance;

  return between(a, b, span > 0 ? (distance - a.distance) / span : 0);
}

/**
 * The stretch of the profile between two distances: the samples inside it, with
 * the two ends interpolated onto it, so it starts and stops exactly where it was
 * asked to rather than at the nearest sample. The distance axis is
 * non-decreasing, so the first sample is found by bisection — a profile runs to
 * thousands of points and this is read on every frame of a drag.
 */
export function profileSlice(
  points: ElevationProfilePoint[],
  from: number,
  to: number,
): ElevationProfilePoint[] {
  const start = profilePointAtDistance(points, from);

  const end = profilePointAtDistance(points, to);

  if (!start || !end) {
    return [];
  }

  // Measured against the ends as clamped, not as asked for: a stretch reaching
  // past the profile would otherwise carry its first or last sample twice, once
  // as itself and once as the end standing on it.
  const first = lowerBound(
    points.length,
    (i) => points[i]!.distance > start.distance,
  );

  const slice: ElevationProfilePoint[] = [start];

  for (
    let i = first;
    i < points.length && points[i]!.distance < end.distance;
    i++
  ) {
    slice.push(points[i]!);
  }

  slice.push(end);

  return slice;
}

/**
 * The profile's runs of real elevation: a non-finite one is a break — the pause
 * between two recording segments, a stretch the terrain model had no answer for
 * — and what is drawn stops there rather than crossing it.
 */
export function elevatedRuns(
  points: ElevationProfilePoint[],
): ElevationProfilePoint[][] {
  const runs: ElevationProfilePoint[][] = [];

  let run: ElevationProfilePoint[] = [];

  for (const point of points) {
    if (Number.isFinite(point.ele)) {
      run.push(point);
    } else if (run.length) {
      runs.push(run);

      run = [];
    }
  }

  if (run.length) {
    runs.push(run);
  }

  return runs;
}

/**
 * The point on the profile's own polyline nearest the given position, found by
 * projecting onto every segment. The profile carries the charted geometry's
 * coordinates, so this hit-tests the line on the map without knowing which
 * feature drew it.
 *
 * Segments span metres, so they are compared in a plane with longitude scaled
 * by the latitude's cosine rather than on the sphere: the error over such a
 * span is far below the pointer tolerance the caller applies, and this runs for
 * every segment on every pointer move.
 *
 * The jump between two recording segments carries no distance and is drawn
 * nowhere, so it is not projected onto — a pointer crossing the empty space
 * between a pause's two ends is not on the line.
 */
export function projectOnProfile(
  points: ElevationProfilePoint[],
  lat: number,
  lon: number,
): ElevationProfilePoint | undefined {
  if (points.length < 2) {
    return points[0];
  }

  const kx = Math.cos((lat * Math.PI) / 180);

  const px = lon * kx;

  let nearest = Number.POSITIVE_INFINITY;

  let nearestIndex = 0;

  let nearestT = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;

    const b = points[i + 1]!;

    if (b.distance === a.distance) {
      continue;
    }

    const ax = a.lon * kx;

    const dx = b.lon * kx - ax;

    const dy = b.lat - a.lat;

    const len2 = dx * dx + dy * dy;

    const t =
      len2 === 0
        ? 0
        : Math.min(
            1,
            Math.max(0, ((px - ax) * dx + (lat - a.lat) * dy) / len2),
          );

    const gapX = px - (ax + t * dx);

    const gapY = lat - (a.lat + t * dy);

    const gap = gapX * gapX + gapY * gapY;

    if (gap < nearest) {
      nearest = gap;

      nearestIndex = i;

      nearestT = t;
    }
  }

  return between(points[nearestIndex]!, points[nearestIndex + 1]!, nearestT);
}
