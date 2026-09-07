import { cumulativeDistances } from '@shared/geoutils.js';
import type { Feature, LineString, Position } from 'geojson';
import type { Alternative } from './actions.js';
import { flattenSteps } from './routeGeometry.js';

/**
 * A stretch of a route whose elevation is laid down straight rather than
 * sampled, in metres along the route. Metres rather than point indices because
 * the profile line gets densified afterwards, which shifts every index but
 * leaves distances along the line untouched.
 */
export interface LevelledSpan {
  start: number;
  end: number;
  /**
   * A deck is at or above the ground it spans and a bore at or below it, so
   * each is clamped against the terrain; `unrouted` — the straight line drawn
   * where routing failed — has no road either side of it to clamp to.
   */
  kind: 'bridge' | 'tunnel' | 'unrouted';
}

/**
 * Flattens an alternative's legs and steps into a single coordinate list,
 * dropping the vertex that consecutive steps share, and collects the stretches
 * whose elevation is laid down straight as spans along the resulting line.
 * Parts of one stretch reported by adjacent steps are joined back together.
 */
export function flattenLevelledSpans(alternative: Alternative): {
  coordinates: Position[];
  spans: LevelledSpan[];
} {
  const hit = flattened.get(alternative);

  if (hit) {
    return hit;
  }

  const result = flatten(alternative);

  flattened.set(alternative, result);

  return result;
}

/**
 * Both the profile and colorize ask for this, and it walks every coordinate —
 * but an alternative is immutable, so it is walked once and remembered until it
 * is dropped.
 */
const flattened = new WeakMap<
  Alternative,
  ReturnType<typeof flattenLevelledSpans>
>();

function flatten(alternative: Alternative) {
  const { coordinates, steps } = flattenSteps(alternative);

  const ranges: [number, number, LevelledSpan['kind']][] = [];

  const push = (
    a: number | undefined,
    b: number | undefined,
    kind: LevelledSpan['kind'],
  ) => {
    if (a === undefined || b === undefined || b <= a) {
      return;
    }

    const last = ranges.at(-1);

    // Only a stretch of the same kind is joined: a bridge and the tunnel after
    // it are levelled against the terrain by opposite rules.
    if (last && a <= last[1] && last[2] === kind) {
      last[1] = Math.max(last[1], b);
    } else {
      ranges.push([a, b, kind]);
    }
  };

  for (const { step, indices } of steps) {
    // A step that failed to route is a straight line between two waypoints, so
    // the whole of it is unrouted.
    if (step.mode === 'error') {
      push(indices[0], indices.at(-1), 'unrouted');

      continue;
    }

    for (const { from, to, kind } of step.structures ?? []) {
      push(indices[from], indices[to], kind);
    }
  }

  const cum = ranges.length === 0 ? [] : cumulativeDistances(coordinates);

  return {
    coordinates,
    spans: ranges.map(([a, b, kind]) => ({
      start: cum[a]!,
      end: cum[b]!,
      kind,
    })),
  };
}

/** How much road outside a structure an anchor is taken from… */
const anchorSpanMeters = 10;

/** …and how many samples it needs regardless, where they're further apart. */
const anchorSamples = 3;

/**
 * The road's elevation outside a structure, as the median of the samples from
 * `index` in `direction`: those within {@link anchorSpanMeters}, but never
 * fewer than {@link anchorSamples}.
 *
 * A median rather than the sample nearest the structure: a portal or an
 * abutment is one of the likeliest places in a terrain model for a single
 * sample to sit metres off the road, and anchoring the whole span on that one
 * sample tilts it. Taking the median from the road a little further back costs
 * only the grade over that distance.
 */
function anchorElevation(
  coordinates: Position[],
  cum: number[],
  index: number,
  direction: 1 | -1,
): number | undefined {
  const values: number[] = [];

  for (let i = index; i >= 0 && i < cum.length; i += direction) {
    if (
      values.length >= anchorSamples &&
      Math.abs(cum[i]! - cum[index]!) > anchorSpanMeters
    ) {
      break;
    }

    const z = coordinates[i]![2];

    if (z !== undefined) {
      values.push(z);
    }
  }

  values.sort((x, y) => x - y);

  return values[(values.length - 1) >> 1];
}

/**
 * Lays a straight line across each structure — a bridge deck and a tunnel bore
 * are straight, whereas the terrain model gives the stream bed below or the
 * ridge above.
 *
 * The line covers the span's own end samples, not just what lies between them:
 * a short bridge often has no sample strictly inside it, so the whole notch is
 * those two ends. Its anchors therefore come from one sample further out again.
 *
 * Rather than replacing the terrain outright, the line is clamped against it —
 * a deck is never below the ground it spans, a bore never above it. That makes
 * reaching past the mapped ends safe: beyond the real structure the terrain is
 * already on the right side of the line, so nothing changes there. Points
 * outside a span keep their sampled elevation. The input is not mutated; a
 * route with no structures is returned as-is.
 */
export function levelSpans(
  feature: Feature<LineString>,
  structures: LevelledSpan[],
): Feature<LineString> {
  if (structures.length === 0) {
    return feature;
  }

  const cum = cumulativeDistances(feature.geometry.coordinates);

  // Distances are re-accumulated on the densified line, so the spans' own ends
  // land on their vertices only to within rounding.
  const eps = 1e-6;

  const coordinates = feature.geometry.coordinates.map((coord) =>
    coord.slice(),
  );

  let changed = false;

  for (const { start, end, kind } of structures) {
    // The structure's own end samples…
    let first = 0;

    while (first + 1 < cum.length && cum[first + 1]! <= start + eps) {
      first++;
    }

    let last = cum.length - 1;

    while (last > 0 && cum[last - 1]! >= end - eps) {
      last--;
    }

    // …and the samples the line is anchored on, one further out.
    const a = Math.max(0, first - 1);

    const b = Math.min(cum.length - 1, last + 1);

    const za = anchorElevation(coordinates, cum, a, -1);

    const zb = anchorElevation(coordinates, cum, b, 1);

    const span = cum[b]! - cum[a]!;

    if (za === undefined || zb === undefined || b - a < 2 || !(span > 0)) {
      continue;
    }

    for (let i = a + 1; i < b; i++) {
      const z = coordinates[i]![2];

      const line = za + ((zb - za) * (cum[i]! - cum[a]!)) / span;

      const levelled =
        z === undefined || kind === 'unrouted'
          ? line
          : kind === 'tunnel'
            ? Math.min(z, line)
            : Math.max(z, line);

      if (levelled !== z) {
        coordinates[i]![2] = levelled;

        changed = true;
      }
    }
  }

  return changed
    ? { ...feature, geometry: { ...feature.geometry, coordinates } }
    : feature;
}
