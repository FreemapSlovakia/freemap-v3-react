import type { Feature, Polygon, Position } from 'geojson';
import type { Alternative } from './actions.js';

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
