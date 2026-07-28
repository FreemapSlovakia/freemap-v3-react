import { lineSegments, smoothValues } from '@shared/geoutils.js';
import { distance } from '@turf/distance';
import type { Feature, LineString, MultiLineString, Position } from 'geojson';

/**
 * How deep a dip must be before it's filled. Below this the ditch is within the
 * terrain model's own noise, and levelling it would only churn the profile.
 */
const minDepthMeters = 1;

/**
 * Running extreme of `values` over every index within `radius` metres, by the
 * positions in `cum`. One monotonic deque per pass, so the whole window slides
 * in linear time regardless of how many points it holds.
 */
function runningExtreme(
  values: number[],
  cum: number[],
  radius: number,
  max: boolean,
): number[] {
  const out: number[] = [];

  // Indices with monotonically decreasing (max) / increasing (min) values; the
  // front is the extreme of the current window.
  const deque: number[] = [];

  let lo = 0;

  let hi = 0;

  for (let i = 0; i < values.length; i++) {
    while (hi < values.length && cum[hi]! <= cum[i]! + radius) {
      while (
        deque.length > 0 &&
        (max
          ? values[deque[deque.length - 1]!]! <= values[hi]!
          : values[deque[deque.length - 1]!]! >= values[hi]!)
      ) {
        deque.pop();
      }

      deque.push(hi);

      hi++;
    }

    while (cum[lo]! < cum[i]! - radius) {
      if (deque[0] === lo) {
        deque.shift();
      }

      lo++;
    }

    out.push(values[deque[0]!]!);
  }

  return out;
}

/**
 * Fills the dips of one elevation series that are narrower than `window`
 * metres, by grayscale morphological closing (a running maximum followed by a
 * running minimum). Closing is the identity on everything wider than the
 * window — slopes, ridges, and broad valleys come back bit-for-bit — so unlike
 * an averaging filter it can't erode genuine terrain detail. Only a run whose
 * deepest point clears {@link minDepthMeters} is taken, and it is then bridged
 * by a straight line between the points either side of it; a run's ends sit at
 * zero residual, so the result stays continuous.
 */
export function closeNarrowDips(
  elevations: number[],
  cum: number[],
  window: number,
): number[] {
  const radius = window / 2;

  if (!(radius > 0) || elevations.length === 0) {
    return elevations.slice();
  }

  // Both passes need a full window to either side, or the closing raises the
  // ends of a plain slope. Extend the series with the end values repeated over
  // a window's worth of distance, then crop back.
  const pad = 16;

  const step = (2 * radius) / pad;

  const paddedE = [...elevations];

  const paddedC = [...cum];

  for (let k = 1; k <= pad; k++) {
    paddedE.unshift(elevations[0]!);

    paddedC.unshift(cum[0]! - k * step);

    paddedE.push(elevations.at(-1)!);

    paddedC.push(cum.at(-1)! + k * step);
  }

  const closed = runningExtreme(
    runningExtreme(paddedE, paddedC, radius, true),
    paddedC,
    radius,
    false,
  ).slice(pad, pad + elevations.length);

  const out = elevations.slice();

  for (let i = 0; i < closed.length; ) {
    if (closed[i]! <= elevations[i]!) {
      i++;

      continue;
    }

    let end = i;

    let deepest = 0;

    while (end < closed.length && closed[end]! > elevations[end]!) {
      deepest = Math.max(deepest, closed[end]! - elevations[end]!);

      end++;
    }

    if (deepest >= minDepthMeters) {
      // The road runs straight across a culvert, so bridge the dip between the
      // points either side of it. The closing's own values only reach the lower
      // of the two rims, which reads as a flat shelf ending in a step wherever
      // the rims differ. Its result still bounds the fill from below, so a
      // point that isn't part of the dip is never pulled down.
      const a = i - 1;

      const span = a >= 0 && end < closed.length ? cum[end]! - cum[a]! : 0;

      for (let j = i; j < end; j++) {
        out[j] =
          span > 0
            ? Math.max(
                elevations[j]!,
                elevations[a]! +
                  ((elevations[end]! - elevations[a]!) * (cum[j]! - cum[a]!)) /
                    span,
              )
            : closed[j]!;
      }
    }

    i = end;
  }

  return out;
}

/**
 * Running median of one elevation series over a centered window of `window`
 * metres. A median drops a spike narrower than half the window outright and
 * leaves a slope alone, where averaging would only spread the spike into a
 * bump; a road profile has no genuine one-sample summit to lose.
 *
 * This is the symmetric counterpart to {@link closeNarrowDips}: it takes the
 * upward spikes a terrain model produces where the way is digitised a few
 * metres off the road it describes, which a fill-only pass can't see.
 */
export function despike(
  elevations: number[],
  cum: number[],
  window: number,
): number[] {
  const radius = window / 2;

  if (!(radius > 0)) {
    return elevations.slice();
  }

  const last = cum.length - 1;

  return elevations.map((_, i) => {
    // The window shrinks symmetrically near the ends. A one-sided window would
    // pull the first and last points off a plain slope, since the median of a
    // truncated window is no longer the middle of a monotone run.
    const r = Math.min(radius, cum[i]! - cum[0]!, cum[last]! - cum[i]!);

    const values: number[] = [];

    for (let j = i; j >= 0 && cum[i]! - cum[j]! <= r; j--) {
      values.push(elevations[j]!);
    }

    for (let j = i + 1; j <= last && cum[j]! - cum[i]! <= r; j++) {
      values.push(elevations[j]!);
    }

    values.sort((a, b) => a - b);

    return values[(values.length - 1) >> 1]!;
  });
}

/** The windows governing {@link smoothElevationSeries}, in metres. */
export interface ElevationWindows {
  despikeWindow: number;
  ditchFillWindow: number;
}

/**
 * Runs the whole clean-up over one gap-free elevation series: {@link despike},
 * a light average, then {@link closeNarrowDips}. Despiking comes first, so the
 * dip fill's depth test reads clean values.
 *
 * The average spans half the median's window. A median outputs one of its own
 * input samples, so it can only jump between them and leaves the profile in
 * flat steps; the shorter average rounds those off without letting the spikes
 * back in.
 *
 * Every consumer of terrain-model elevation goes through here — the profile a
 * drawn line samples as much as a planned route's render copy — so they can't
 * drift apart. Recorded altitude never does: these correct a terrain model, not
 * a barometer.
 */
export function smoothElevationSeries(
  elevations: number[],
  cum: number[],
  { despikeWindow, ditchFillWindow }: ElevationWindows,
): number[] {
  return closeNarrowDips(
    smoothValues(
      despike(elevations, cum, despikeWindow),
      cum,
      despikeWindow / 2,
    ),
    cum,
    ditchFillWindow,
  );
}

/**
 * Applies {@link smoothElevationSeries} to
 * a line-like feature's elevation, segment by segment so no window reaches
 * across the gap between them. Runs of points that carry no usable elevation
 * split their segment further — a gap is neither a spike nor a dip. The input is never
 * mutated; a feature nothing applies to is returned as-is.
 *
 * The average spans half the median's window. A median leaves the profile in
 * flat steps — it outputs one of its input samples, so it can only jump between
 * them — and averaging over a shorter span rounds those off without letting the
 * spikes back in.
 */
export function smoothElevation<G extends LineString | MultiLineString>(
  feature: Feature<G>,
  windows: ElevationWindows,
): Feature<G> {
  if (!(windows.despikeWindow > 0) && !(windows.ditchFillWindow > 0)) {
    return feature;
  }

  let changed = false;

  const smoothed = lineSegments(feature.geometry).map((coords) => {
    const out: Position[] = coords.map((coord) => coord.slice());

    // A non-finite ordinate counts as no elevation: it can't be compared, so it
    // would neither be filled nor terminate a run.
    const hasElevation = (i: number) => Number.isFinite(out[i]?.[2]);

    // Index ranges of consecutive points that have an elevation.
    for (let from = 0; from < out.length; from++) {
      if (!hasElevation(from)) {
        continue;
      }

      let to = from;

      while (to + 1 < out.length && hasElevation(to + 1)) {
        to++;
      }

      if (to > from) {
        const run = out.slice(from, to + 1);

        const cum = [0];

        for (let i = 1; i < run.length; i++) {
          cum.push(
            cum[i - 1]! + distance(run[i - 1]!, run[i]!, { units: 'meters' }),
          );
        }

        const elevations = run.map((coord) => coord[2]!);

        smoothElevationSeries(elevations, cum, windows).forEach((ele, i) => {
          if (ele !== elevations[i]) {
            out[from + i]![2] = ele;

            changed = true;
          }
        });
      }

      from = to;
    }

    return out;
  });

  if (!changed) {
    return feature;
  }

  const geometry =
    feature.geometry.type === 'LineString'
      ? { type: 'LineString' as const, coordinates: smoothed[0]! }
      : { type: 'MultiLineString' as const, coordinates: smoothed };

  return { ...feature, geometry } as Feature<G>;
}
