import { flatten } from '@turf/flatten';
import { simplify } from '@turf/simplify';
import type { Feature, FeatureCollection, LineString, Position } from 'geojson';

/**
 * Vertices a converted drawing should end up with. Enough to keep the shape,
 * few enough to edit by hand — and to fit the URL, which carries every vertex
 * at some 22 characters and is rewritten whenever the map state changes.
 */
const TARGET_VERTICES = 500;

/** Below this there is nothing worth simplifying away. */
const MIN_VERTICES = 750;

/** The coarsest tolerance ever suggested — about a kilometre. */
const MAX_TOLERANCE = 0.01;

/** How the prompt spells a tolerance: 10⁻⁵ degrees, so it reads as an integer. */
export const TOLERANCE_UNIT = 100000;

function verticesAt(lines: Position[][], tolerance: number): number {
  return lines.reduce((n, coordinates) => {
    const line: LineString = { type: 'LineString', coordinates };

    return (
      n + simplify(line, { tolerance, highQuality: true }).coordinates.length
    );
  }, 0);
}

/**
 * A simplification factor to offer for these lines, in the prompt's unit — the
 * gentlest one that still gets them down to about {@link TARGET_VERTICES}
 * vertices, so a dense recording is offered a strong simplification and a
 * sparse one a mild one. Zero when the lines are small enough to convert as
 * they are, which is also how a caller asks whether simplifying is worth
 * offering at all.
 */
export function suggestSimplifyTolerance(lines: Position[][]): number {
  if (lines.reduce((n, line) => n + line.length, 0) <= MIN_VERTICES) {
    return 0;
  }

  // Bisect: the vertex count falls as the tolerance grows, and the answer only
  // has to be a sensible default the user can overwrite.
  let tooFine = 0;

  let enough = MAX_TOLERANCE;

  for (let i = 0; i < 12; i++) {
    const mid = (tooFine + enough) / 2;

    if (verticesAt(lines, mid) > TARGET_VERTICES) {
      tooFine = mid;
    } else {
      enough = mid;
    }
  }

  // Rounded up: the whole unit below the tolerance found is a finer one, which
  // would leave more vertices than the budget the search just met.
  return Math.max(1, Math.ceil(enough * TOLERANCE_UNIT));
}

/**
 * The lines a conversion of this geodata will produce — every line and every
 * polygon ring, points ignored. What {@link suggestSimplifyTolerance} is asked
 * about when the source is geodata rather than a track of its own.
 */
export function convertibleLines(
  geojson: Feature | FeatureCollection,
): Position[][] {
  return flatten(geojson).features.flatMap((feature) => {
    const { geometry } = feature;

    return geometry?.type === 'LineString'
      ? [geometry.coordinates]
      : geometry?.type === 'Polygon'
        ? geometry.coordinates
        : [];
  });
}
