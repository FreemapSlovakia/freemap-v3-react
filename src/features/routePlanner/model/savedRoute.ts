import type { Feature, LineString } from 'geojson';
import { type Alternative, routeKey, type SavedRoute } from './actions.js';
import type { RoutePlannerState } from './reducer.js';
import { flattenWithStructures } from './structureElevation.js';

/**
 * Whether any leg is a straight line standing in for a segment the router didn't
 * answer for — a request that failed, or a route it couldn't find.
 */
export function routeFailed(alternative: Alternative): boolean {
  return alternative.legs.some((leg) =>
    leg.steps.some((step) => step.mode === 'error'),
  );
}

/**
 * Whether the sampled line says anything the alternative's own coordinates
 * don't. On the free tier a GraphHopper route is neither densified nor
 * re-sampled, so storing the line would only duplicate the route.
 */
function sampledLineIsWorthStoring(
  line: Feature<LineString>,
  alternative: Alternative,
): boolean {
  const { coordinates } = flattenWithStructures(alternative);

  return (
    coordinates.length !== line.geometry.coordinates.length ||
    line.geometry.coordinates.some(
      (coord, i) => coord[2] !== coordinates[i]![2],
    )
  );
}

/**
 * The route to store in a map document, or nothing when there is none to store.
 * Isochrones are areas rather than a route and are recomputed on open.
 */
export function savedRouteFromState(
  state: RoutePlannerState,
): SavedRoute | undefined {
  const alternative = state.alternatives[state.activeAlternativeIndex];

  if (!alternative || state.mode === 'isochrone' || state.timestamp === null) {
    return undefined;
  }

  // Storing what the router failed to answer would replay the failure on every
  // open — and, being authoritative, stop the re-route that would fix it.
  if (routeFailed(alternative)) {
    return undefined;
  }

  // Saving while the next route is in flight: the waypoints have moved past the
  // line on screen. Storing it under their key would draw a route that doesn't
  // join them, and stop the re-route that would fix it — so store nothing and
  // let the map route itself on open.
  if (state.resultKey !== routeKey(state)) {
    return undefined;
  }

  const sampled = state.sampledGeojson?.line;

  return {
    key: state.resultKey,
    timestamp: state.timestamp,
    alternative,
    waypoints: state.waypoints,
    ...(sampled && sampledLineIsWorthStoring(sampled, alternative)
      ? { geometry: sampled }
      : {}),
  };
}
