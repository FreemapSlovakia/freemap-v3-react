import { clearMapFeatures } from '@app/store/actions.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import {
  densifyAlong,
  enrichElevations,
  withElevationSources,
} from '@shared/elevation.js';
import { smoothElevation } from '@shared/elevationSmoothing.js';
import { lineString } from '@turf/helpers';
import type { Feature, LineString, Position } from 'geojson';
import type { Dispatch } from 'redux';
import type { Alternative } from './actions.js';
import {
  routePlannerDelete,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetRenderGeojson,
  routePlannerSetResult,
  routePlannerSetSampledGeojson,
} from './actions.js';
import {
  flattenWithStructures,
  straightenStructures,
} from './structureElevation.js';

const cancelActions = [
  routePlannerSetResult,
  routePlannerSetActiveAlternativeIndex,
  routePlannerDelete,
  clearMapFeatures,
];

/**
 * Lazily builds the render-only elevation line for the active alternative and
 * caches it via {@link routePlannerSetRenderGeojson}.
 *
 * It is built in two steps, cached separately: the sampled line, which costs
 * requests, and the levelling and smoothing on top of it, which are pure. That
 * way changing the smoothing preferences re-derives without asking the
 * elevation service again — and a route that came with a saved map carries its
 * sampled line, so the profile is there offline and still follows those
 * preferences.
 *
 * For premium users every vertex is overridden from our terrain model — which
 * serves a high-resolution DEM where available — and long segments are then
 * densified at DEM resolution, so the profile is smooth and consistent
 * regardless of the router. For everyone else the router's own elevation is
 * kept (GraphHopper supplies it) and only coordinates that lack it (e.g. OSRM)
 * are sampled from the terrain model; the line isn't densified, so free routing
 * doesn't load the elevation service.
 *
 * Only the elevation chart and elevation/steepness colorize read it; the source
 * `alternatives` stay the router's, so export and the drawn route are
 * untouched. A planned route has no recorded measurement to preserve, so
 * overriding is safe.
 *
 * Bridges and tunnels GraphHopper reported are then levelled to a straight line
 * between their ends: the terrain model has bridges removed and mountains
 * intact, so it reads the stream bed below or the ridge above instead of the
 * road. This uses the router's own tagging rather than detecting spikes, so
 * genuine narrow terrain features are left alone. OSRM reports no such data,
 * and its routes keep the artifacts. What no router can flag — the ditches a
 * conditioned terrain model digs for culverts — is then filled by
 * {@link smoothElevation}.
 */
export async function ensureRouteRenderGeojson(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
): Promise<void> {
  const {
    alternatives,
    activeAlternativeIndex,
    renderGeojson,
    sampledGeojson,
  } = getState().routePlanner;

  if (renderGeojson) {
    return;
  }

  const alternative = alternatives[activeAlternativeIndex];

  if (!alternative) {
    return;
  }

  const { coordinates, structures } = flattenWithStructures(alternative);

  if (coordinates.length < 2) {
    return;
  }

  const sampled =
    sampledGeojson?.line ??
    (await sample(coordinates, alternative, getState, dispatch));

  if (!sampled) {
    return;
  }

  // Levelling comes after densifying: the inserted points are sampled from the
  // terrain model too, so they'd put the artifact straight back inside a long
  // bridge.
  const render = smoothElevation(
    straightenStructures(sampled, structures),
    getState().elevationSettings,
  );

  if (getState().routePlanner.renderGeojson) {
    return;
  }

  dispatch(routePlannerSetRenderGeojson(render));
}

/**
 * The step that costs requests: elevation for every coordinate, densified for
 * premium. Caches what it builds, and returns nothing if the route moved on
 * while it was sampling.
 */
async function sample(
  coordinates: Position[],
  alternative: Alternative,
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
): Promise<Feature<LineString> | undefined> {
  const premium = isPremium(getState().auth.user);

  // What answered across both reads below, stamped onto the sampled line so the
  // chart credits the models this very profile was sampled from.
  const sources = new Set<string>();

  // Premium overrides every vertex from the terrain model; everyone else keeps
  // the router's own elevation and only fills coordinates that lack it.
  const [enriched] = await enrichElevations(
    [lineString(coordinates)],
    premium ? 'all' : 'missing',
    getState,
    cancelActions,
    sources,
  );

  // Densify only for premium, so a GraphHopper route on the free tier doesn't
  // hit the elevation service at all.
  const densified = premium
    ? await densifyAlong(enriched!, getState, cancelActions, sources)
    : enriched!;

  // The route may have changed (or a concurrent call won) while sampling.
  const after = getState().routePlanner;

  if (after.alternatives[after.activeAlternativeIndex] !== alternative) {
    return undefined;
  }

  if (after.sampledGeojson) {
    return after.sampledGeojson.line;
  }

  const sampled = withElevationSources(densified, sources);

  dispatch(routePlannerSetSampledGeojson(sampled));

  return sampled;
}
