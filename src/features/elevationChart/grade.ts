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
 * The elevation that far along, interpolated between the two samples it falls
 * between, searched within `start`…`end` alone. That range is one unbroken
 * stretch of the profile, so the pair found always spans real terrain — where
 * distances repeat, at a pause, a search over the whole profile could straddle
 * the break instead.
 */
function eleAtDistance(
  points: ElevationProfilePoint[],
  start: number,
  end: number,
  distance: number,
): number {
  if (distance <= points[start]!.distance) {
    return points[start]!.ele;
  }

  if (distance >= points[end]!.distance) {
    return points[end]!.ele;
  }

  let lo = start;

  let hi = end;

  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;

    if (points[mid]!.distance <= distance) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const span = points[hi]!.distance - points[lo]!.distance;

  return span > 0
    ? points[lo]!.ele +
        ((points[hi]!.ele - points[lo]!.ele) *
          (distance - points[lo]!.distance)) /
          span
    : points[hi]!.ele;
}

/**
 * The along-track grade at a marked place as a ratio — 0.05 is a 5 % climb in
 * the direction of travel, negative descends. Measured as rise over run across
 * a window `windowMeters` long centered on the place, its ends interpolated
 * between the samples they fall between rather than snapped to them: the window
 * is then the length that was asked for, and it slides with the pointer instead
 * of jumping a whole sample at a time — on a profile whose samples are tens of
 * metres apart the snapped window would sit still across half a slope and then
 * lurch, never reading the grade the slope actually has.
 *
 * The window stops at the ends of the unbroken stretch the place stands on —
 * the profile's own ends, or a gap (points with no elevation) either side — so
 * no rise is read across terrain we don't know. Against one of those it slides
 * rather than shrinks, keeping its length while there is room for it.
 *
 * A zero window measures the segment the place stands between, which is the
 * limit the readout approaches as the window closes; a place standing on a
 * sample has no such segment, so it reads the nearer of the two meeting there
 * rather than what a closing window would average them to. An infinite window
 * measures the whole stretch, the same reading wherever on it the place is.
 * `undefined` where the place has no elevation or nothing to measure against.
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

  // A place standing on a sample has no segment of its own, and samples can
  // coincide besides. Open to the nearer neighbour until there is a run.
  while (points[hi]!.distance - points[lo]!.distance <= 0) {
    const nextLo = lo > 0 && Number.isFinite(points[lo - 1]!.ele) ? lo - 1 : -1;

    const nextHi =
      hi < points.length - 1 && Number.isFinite(points[hi + 1]!.ele)
        ? hi + 1
        : -1;

    if (nextLo < 0 && nextHi < 0) {
      return undefined;
    }

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

  const segmentGrade =
    (points[hi]!.ele - points[lo]!.ele) /
    (points[hi]!.distance - points[lo]!.distance);

  if (!(windowMeters > 0)) {
    return segmentGrade;
  }

  // Where the window is measured from. That is the place itself while it stands
  // on the stretch, and the near end of the stretch while it doesn't — a place
  // past the last sample before a gap keeps that sample's elevation, so it is a
  // reading like any other, but the window it asks for lies wholly behind it.
  const anchor = Math.min(
    Math.max(point.distance, points[lo]!.distance),
    points[hi]!.distance,
  );

  // The stretch the window may draw on. Walked out only as far as the window
  // can reach — its own length either way, which covers one slid off an end —
  // so a pointer moving along a long profile doesn't scan it end to end.
  let start = lo;

  while (
    start > 0 &&
    Number.isFinite(points[start - 1]!.ele) &&
    points[start]!.distance > anchor - windowMeters
  ) {
    start--;
  }

  let end = hi;

  while (
    end < points.length - 1 &&
    Number.isFinite(points[end + 1]!.ele) &&
    points[end]!.distance < anchor + windowMeters
  ) {
    end++;
  }

  const startD = points[start]!.distance;

  const endD = points[end]!.distance;

  let from = point.distance - windowMeters / 2;

  let to = point.distance + windowMeters / 2;

  if (from < startD) {
    to = Math.min(endD, to + (startD - from));

    from = startD;
  }

  if (to > endD) {
    from = Math.max(startD, from - (to - endD));

    to = endD;
  }

  const run = to - from;

  return run > 0
    ? (eleAtDistance(points, start, end, to) -
        eleAtDistance(points, start, end, from)) /
        run
    : segmentGrade;
}
