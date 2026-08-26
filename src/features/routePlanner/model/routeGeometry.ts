import type { Feature, Polygon, Position } from 'geojson';
import type { Alternative, Step } from './actions.js';

/**
 * An alternative as the single line it draws: every step's coordinates, with
 * the duplicate each leg/step shares with the next one's start dropped so the
 * joints don't stack two nodes.
 */
export function alternativeCoordinates(alternative: Alternative): Position[] {
  return alternative.legs
    .flatMap((leg) => leg.steps.flatMap((step) => step.geometry.coordinates))
    .filter(
      (coord, i, all) =>
        i === 0 || coord[0] !== all[i - 1][0] || coord[1] !== all[i - 1][1],
    );
}

/**
 * {@link alternativeCoordinates} plus where each step's own coordinates ended up
 * in it, which is what turns a range a step reports (structures, path details)
 * into a range along the whole line.
 */
export function flattenSteps(alternative: Alternative): {
  coordinates: Position[];
  steps: { step: Step; indices: number[] }[];
} {
  const coordinates: Position[] = [];

  const steps: { step: Step; indices: number[] }[] = [];

  for (const leg of alternative.legs) {
    for (const step of leg.steps) {
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

      steps.push({ step, indices });
    }
  }

  return { coordinates, steps };
}

/**
 * The lines converting the route-planner result would draw — the isochrone
 * rings when there are any, else the active alternative. What the conversion's
 * simplification is measured against.
 */
export function plannedRouteLines(
  isochrones: Feature<Polygon>[] | null | undefined,
  alternative: Alternative | undefined,
): Position[][] {
  return isochrones?.length
    ? isochrones.flatMap((isochrone) => isochrone.geometry.coordinates)
    : alternative
      ? [alternativeCoordinates(alternative)]
      : [];
}
