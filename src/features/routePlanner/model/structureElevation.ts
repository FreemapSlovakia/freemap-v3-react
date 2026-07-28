import { distance } from '@turf/distance';
import type { Feature, LineString, Position } from 'geojson';
import type { Alternative } from './actions.js';

/**
 * A stretch of a route carried by a bridge or running through a tunnel,
 * measured in metres along the route. Metres rather than point indices because
 * the profile line gets densified afterwards, which shifts every index but
 * leaves distances along the line untouched.
 */
export interface StructureSpan {
  start: number;
  end: number;
}

function cumulativeMeters(coordinates: Position[]): number[] {
  const cum = [0];

  for (let i = 1; i < coordinates.length; i++) {
    cum.push(
      cum[i - 1]! +
        distance(coordinates[i - 1]!, coordinates[i]!, { units: 'meters' }),
    );
  }

  return cum;
}

/**
 * Flattens an alternative's legs and steps into a single coordinate list,
 * dropping the vertex that consecutive steps share, and collects the bridge and
 * tunnel stretches reported per step as spans along the resulting line. Parts
 * of one structure reported by adjacent steps are joined back together.
 */
export function flattenWithStructures(alternative: Alternative): {
  coordinates: Position[];
  structures: StructureSpan[];
} {
  const coordinates: Position[] = [];

  const ranges: [number, number][] = [];

  for (const leg of alternative.legs) {
    for (const step of leg.steps) {
      // Where each of the step's own coordinates ended up in the flat list.
      const indices: number[] = [];

      for (const coord of step.geometry.coordinates) {
        const prev = coordinates.at(-1);

        if (prev && prev[0] === coord[0] && prev[1] === coord[1]) {
          indices.push(coordinates.length - 1);
        } else {
          indices.push(coordinates.length);

          coordinates.push(coord);
        }
      }

      for (const { from, to } of step.structures ?? []) {
        const a = indices[from];

        const b = indices[to];

        if (a === undefined || b === undefined || b <= a) {
          continue;
        }

        const last = ranges.at(-1);

        if (last && a <= last[1]) {
          last[1] = Math.max(last[1], b);
        } else {
          ranges.push([a, b]);
        }
      }
    }
  }

  const cum = ranges.length === 0 ? [] : cumulativeMeters(coordinates);

  return {
    coordinates,
    structures: ranges.map(([a, b]) => ({ start: cum[a]!, end: cum[b]! })),
  };
}

/** How much road outside a structure an anchor is taken from. */
const anchorSpanMeters = 10;

/**
 * The road's elevation just outside a structure, as the median of the samples
 * within {@link anchorSpanMeters} of `index` in `direction`.
 *
 * A median rather than the sample at the edge itself: a tunnel's portal node is
 * one of the likeliest places in a terrain model for a single sample to land
 * metres above the road, on the portal face or the wall of the cutting leading
 * to it — and anchoring the whole bore on that one sample tilts it. Taking the
 * median from the road a few metres back costs only the grade over that
 * distance (centimetres) and survives a wall several samples wide.
 */
function anchorElevation(
  coordinates: Position[],
  cum: number[],
  index: number,
  direction: 1 | -1,
): number | undefined {
  const values: number[] = [];

  for (
    let i = index;
    i >= 0 &&
    i < cum.length &&
    Math.abs(cum[i]! - cum[index]!) <= anchorSpanMeters;
    i += direction
  ) {
    const z = coordinates[i]![2];

    if (z !== undefined) {
      values.push(z);
    }
  }

  values.sort((x, y) => x - y);

  return values[(values.length - 1) >> 1];
}

/**
 * Replaces the elevation of every point strictly inside a structure span with a
 * straight line between the road either side of it — a bridge deck and a tunnel
 * bore are straight, whereas the terrain model gives the stream bed below or
 * the ridge above. Points outside a span keep their sampled elevation, so
 * genuine terrain detail is never touched. The input is not mutated; a route
 * with no structures is returned as-is.
 */
export function straightenStructures(
  feature: Feature<LineString>,
  structures: StructureSpan[],
): Feature<LineString> {
  if (structures.length === 0) {
    return feature;
  }

  const cum = cumulativeMeters(feature.geometry.coordinates);

  // Distances are re-accumulated on the densified line, so the spans' own ends
  // land on their vertices only to within rounding.
  const eps = 1e-6;

  const coordinates = feature.geometry.coordinates.map((coord) =>
    coord.slice(),
  );

  let changed = false;

  for (const { start, end } of structures) {
    // The abutments (or portals): the outermost points the structure does not
    // span, where the terrain model still describes the road.
    let a = 0;

    while (a + 1 < cum.length && cum[a + 1]! <= start + eps) {
      a++;
    }

    let b = cum.length - 1;

    while (b > 0 && cum[b - 1]! >= end - eps) {
      b--;
    }

    const za = anchorElevation(coordinates, cum, a, -1);

    const zb = anchorElevation(coordinates, cum, b, 1);

    const span = cum[b]! - cum[a]!;

    if (za === undefined || zb === undefined || b - a < 2 || !(span > 0)) {
      continue;
    }

    for (let i = a + 1; i < b; i++) {
      coordinates[i]![2] = za + ((zb - za) * (cum[i]! - cum[a]!)) / span;

      changed = true;
    }
  }

  return changed
    ? { ...feature, geometry: { ...feature.geometry, coordinates } }
    : feature;
}
