import type { ElevationProfilePoint } from './model/reducer.js';

/**
 * Which of `points` the given point stands at: the sample nearest it along the
 * distance axis, the earliest one where two are equally near. It is located by
 * distance rather than by identity because it rarely is one of the profile's
 * own — the pointer marks a place between two samples, and a profile redrawn
 * while the pointer rests on it (a live track gaining positions, say) leaves
 * any reference behind. The axis is non-decreasing, so the pair it falls
 * between is found by bisection, this being called from a selector.
 * `-1` on an empty profile.
 */
export function indexOfProfilePoint(
  points: ElevationProfilePoint[],
  point: ElevationProfilePoint,
): number {
  if (points.length === 0) {
    return -1;
  }

  let lo = 0;

  let hi = points.length;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;

    if (points[mid]!.distance < point.distance) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  // `lo` is the first sample at or past the point.
  const at =
    lo === 0
      ? 0
      : lo === points.length
        ? lo - 1
        : point.distance - points[lo - 1]!.distance <=
            points[lo]!.distance - point.distance
          ? lo - 1
          : lo;

  if (points[at]!.distance !== point.distance) {
    return at;
  }

  // Samples can share a distance — a pause's last fix and the first of the
  // segment resuming somewhere else — and the axis alone cannot say which of
  // them the point stands at, though the grade is measured along a different
  // stretch at each. The position can, so it settles the run. Degrees are
  // compared unscaled: this only ranks candidates, it measures nothing.
  let nearest = at;

  let nearestGap = coordGap(points[at]!, point);

  for (
    let i = at + 1;
    i < points.length && points[i]!.distance === point.distance;
    i++
  ) {
    const gap = coordGap(points[i]!, point);

    if (gap < nearestGap) {
      nearestGap = gap;

      nearest = i;
    }
  }

  return nearest;
}

function coordGap(a: ElevationProfilePoint, b: ElevationProfilePoint) {
  const dLat = a.lat - b.lat;

  const dLon = a.lon - b.lon;

  return dLat * dLat + dLon * dLon;
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
