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
function indexOfProfilePoint(
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
 * The two samples a marked place stands between — the segment of the profile it
 * is on, which is where a window measured about it starts. `undefined` where
 * there is no elevation to measure.
 *
 * A place standing on a sample has no one segment to call its own, so it starts
 * from that sample alone and the window opens either way from there.
 */
function segmentAt(
  points: ElevationProfilePoint[],
  point: ElevationProfilePoint,
): [number, number] | undefined {
  const index = indexOfProfilePoint(points, point);

  const at = points[index];

  if (!at || !Number.isFinite(at.ele)) {
    return undefined;
  }

  // The sample nearest the place is one end of the segment it stands on; which
  // end is whichever side of it the place lies.
  const other = point.distance > at.distance ? index + 1 : index - 1;

  return point.distance !== at.distance &&
    other >= 0 &&
    other < points.length &&
    Number.isFinite(points[other]!.ele)
    ? other > index
      ? [index, other]
      : [other, index]
    : [index, index];
}

/**
 * The along-track grade at a marked place as a ratio — 0.05 is a 5 % climb in
 * the direction of travel, negative descends. Measured as rise over run across
 * a window at least `windowMeters` long centered on the place itself, stopping
 * at the profile's ends and at gaps (points with no elevation), so no rise is
 * read across terrain we don't know.
 *
 * The place is where the pointer is, which is mostly between two of the
 * profile's samples, so the window opens from the segment it stands on and
 * grows about its own distance. A window shorter than the sample spacing then
 * measures that segment alone, and a longer one sits centered on the place.
 * Anchoring on the sample nearest the place instead would describe whatever
 * surrounds *that* — on a profile whose samples are far apart (a hand-drawn
 * GPX, with a point only where the slope changes) the two are different
 * stretches of terrain, and only the first is the one under the pointer.
 *
 * An infinite window runs to the limits above, reporting the rise over run
 * between the ends of the stretch the place lies on — the same reading wherever
 * on it it is. `undefined` where the place has no elevation or nothing to
 * measure against.
 */
export function gradeAt(
  points: ElevationProfilePoint[],
  point: ElevationProfilePoint,
  windowMeters: number,
): number | undefined {
  const segment = segmentAt(points, point);

  if (!segment) {
    return undefined;
  }

  let [lo, hi] = segment;

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

    // Grow the side that reaches less far from the place, keeping the window as
    // centered on it as the remaining room allows.
    if (
      nextLo >= 0 &&
      (nextHi < 0 ||
        point.distance - points[nextLo]!.distance <=
          points[nextHi]!.distance - point.distance)
    ) {
      lo = nextLo;
    } else {
      hi = nextHi;
    }
  }

  const run = points[hi]!.distance - points[lo]!.distance;

  return run > 0 ? (points[hi]!.ele - points[lo]!.ele) / run : undefined;
}
