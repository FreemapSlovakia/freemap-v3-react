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
import type { Dispatch } from 'redux';
import {
  routePlannerDelete,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetRenderGeojson,
  routePlannerSetResult,
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
  const { alternatives, activeAlternativeIndex, renderGeojson } =
    getState().routePlanner;

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

  const line = lineString(coordinates);

  const premium = isPremium(getState().auth.user);

  // What answered across both reads below, stamped onto the render line so the
  // chart credits the models this very profile was sampled from.
  const sources = new Set<string>();

  // Premium overrides every vertex from the terrain model; everyone else keeps
  // the router's own elevation and only fills coordinates that lack it.
  const [enriched] = await enrichElevations(
    [line],
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

  // After densifying: the inserted points are sampled from the terrain model
  // too, so they'd put the artifact straight back inside a long bridge.
  const render = smoothElevation(
    straightenStructures(densified, structures),
    getState().elevationSettings,
  );

  // The route may have changed (or a concurrent call won) while sampling.
  const after = getState().routePlanner;

  if (
    after.renderGeojson ||
    after.alternatives[after.activeAlternativeIndex] !== alternative
  ) {
    return;
  }

  dispatch(routePlannerSetRenderGeojson(withElevationSources(render, sources)));
}
