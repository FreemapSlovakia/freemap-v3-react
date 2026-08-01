import type { ElevationProfilePoint } from './model/reducer.js';

/**
 * Where `point` sits on `points`. The active point is normally one of the
 * profile's own, so identity finds it; a profile redrawn while the pointer
 * rests on it — a live track gaining positions, say — leaves that reference
 * behind, and the same distance along the new profile is the same place.
 * `-1` on an empty profile.
 */
export function indexOfProfilePoint(
  points: ElevationProfilePoint[],
  point: ElevationProfilePoint,
): number {
  const own = points.indexOf(point);

  if (own >= 0) {
    return own;
  }

  let nearest = -1;

  let nearestGap = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i++) {
    const gap = Math.abs(points[i]!.distance - point.distance);

    if (gap < nearestGap) {
      nearestGap = gap;

      nearest = i;
    }
  }

  return nearest;
}

/**
 * The along-track grade at a profile point as a ratio — 0.05 is a 5 % climb in
 * the direction of travel, negative descends. Measured as rise over run across
 * a window at least `windowMeters` long centered on the point, stopping at the
 * profile's ends and at gaps (points with no elevation), so no rise is read
 * across terrain we don't know. A window shorter than the profile's own point
 * spacing simply measures against the nearest neighbour. `undefined` where the
 * point has no elevation or nothing to measure against.
 */
export function gradeAt(
  points: ElevationProfilePoint[],
  index: number,
  windowMeters: number,
): number | undefined {
  const at = points[index];

  if (!at || !Number.isFinite(at.ele)) {
    return undefined;
  }

  let lo = index;

  let hi = index;

  for (;;) {
    const span = points[hi]!.distance - points[lo]!.distance;

    // Widen while the window is short of what was asked for, and always past a
    // zero span — neighbouring points can coincide, and a rise over no run is
    // no grade at all.
    if (span > 0 && span >= windowMeters) {
      break;
    }

    const nextLo = lo > 0 && Number.isFinite(points[lo - 1]!.ele) ? lo - 1 : -1;

    const nextHi =
      hi < points.length - 1 && Number.isFinite(points[hi + 1]!.ele)
        ? hi + 1
        : -1;

    if (nextLo < 0 && nextHi < 0) {
      break;
    }

    // Grow the side that reaches less far from the point, keeping the window as
    // centered as the remaining room allows.
    if (
      nextLo >= 0 &&
      (nextHi < 0 ||
        at.distance - points[nextLo]!.distance <=
          points[nextHi]!.distance - at.distance)
    ) {
      lo = nextLo;
    } else {
      hi = nextHi;
    }
  }

  const run = points[hi]!.distance - points[lo]!.distance;

  return run > 0 ? (points[hi]!.ele - points[lo]!.ele) / run : undefined;
}
