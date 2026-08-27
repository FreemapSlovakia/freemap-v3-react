import { flatten } from '@turf/flatten';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { midLatitude, simplifyIndices, simplifyRing } from './simplifyGeo.js';

/**
 * Vertices a converted drawing should end up with. Enough to keep the shape,
 * few enough to edit by hand — and to fit the URL, which carries every vertex
 * at some 22 characters and is rewritten whenever the map state changes.
 */
const TARGET_VERTICES = 500;

/** Below this there is nothing worth simplifying away. */
const MIN_VERTICES = 750;

/** The span of tolerances a simplification is ever offered, in metres. */
export const MIN_TOLERANCE = 0.1;

export const MAX_TOLERANCE = 1000;

/**
 * Whether the lines being measured are closed rings. It cannot be read off the
 * coordinates — a loop track ends where it started too, and is still thinned as
 * an open line — so only a caller that closed a ring itself says so.
 */
export type Ringness = boolean | undefined;

/**
 * The vertices these lines are made of. A ring's closing point repeats its
 * first and is nothing anyone counts as a point, so it doesn't count here.
 */
export function vertexCount(lines: Position[][], rings?: Ringness): number {
  return lines.reduce((n, line) => n + line.length - (rings ? 1 : 0), 0);
}

/**
 * How many vertices these lines are left with at the given tolerance — the
 * count the dialog offers, so it thins them the way the edit will: a ring
 * through {@link simplifyRing}, which eases the tolerance rather than
 * collapsing the shape. One reference latitude for the lot, as the edit uses
 * one per feature; over lines a continent apart the two differ slightly.
 */
export function verticesAt(
  lines: Position[][],
  meters: number,
  rings?: Ringness,
): number {
  const lat = midLatitude(lines);

  return lines.reduce(
    (n, coordinates) =>
      n +
      (rings
        ? simplifyRing(coordinates, meters, lat).length - 1
        : simplifyIndices(coordinates, meters, lat).length),
    0,
  );
}

/**
 * A tolerance to offer for these lines, in metres — the gentlest one that still
 * gets them down to about {@link TARGET_VERTICES} vertices, so a dense
 * recording is offered a strong simplification and a sparse one a mild one.
 * Zero when the lines are small enough to convert as they are, which is also
 * how a caller asks whether simplifying is worth offering at all.
 */
export function suggestSimplifyTolerance(lines: Position[][]): number {
  if (lines.reduce((n, line) => n + line.length, 0) <= MIN_VERTICES) {
    return 0;
  }

  // Bisected in log space, the way the slider is scaled: a tenth of a metre and
  // ten metres are the same distance apart there, so the fine end is not
  // quantised away. The answer only has to be a sensible default anyway.
  let tooFine = Math.log10(MIN_TOLERANCE);

  let enough = Math.log10(MAX_TOLERANCE);

  for (let i = 0; i < 12; i++) {
    const mid = (tooFine + enough) / 2;

    if (verticesAt(lines, 10 ** mid) > TARGET_VERTICES) {
      tooFine = mid;
    } else {
      enough = mid;
    }
  }

  return 10 ** enough;
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
