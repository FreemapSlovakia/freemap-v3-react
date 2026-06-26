import { clearMapFeatures } from '@app/store/actions.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import { densifyAlong, enrichElevations } from '@shared/elevation.js';
import { lineString } from '@turf/helpers';
import type { Dispatch } from 'redux';
import {
  routePlannerDelete,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetRenderGeojson,
  routePlannerSetResult,
} from './actions.js';

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

  // Consecutive steps share their boundary vertex, so drop the duplicate to
  // avoid a zero-length segment at each step end.
  const coordinates = alternative.legs
    .flatMap((leg) => leg.steps)
    .flatMap((step) => step.geometry.coordinates)
    .filter(
      (c, i, all) =>
        i === 0 || c[0] !== all[i - 1]![0] || c[1] !== all[i - 1]![1],
    );

  if (coordinates.length < 2) {
    return;
  }

  const line = lineString(coordinates);

  const premium = isPremium(getState().auth.user);

  // Premium overrides every vertex from the terrain model; everyone else keeps
  // the router's own elevation and only fills coordinates that lack it.
  const [enriched] = await enrichElevations(
    [line],
    premium ? 'all' : 'missing',
    getState,
    cancelActions,
  );

  // Densify only for premium, so a GraphHopper route on the free tier doesn't
  // hit the elevation service at all.
  const render = premium
    ? await densifyAlong(enriched!, getState, cancelActions)
    : enriched!;

  // The route may have changed (or a concurrent call won) while sampling.
  const after = getState().routePlanner;

  if (
    after.renderGeojson ||
    after.alternatives[after.activeAlternativeIndex] !== alternative
  ) {
    return;
  }

  dispatch(routePlannerSetRenderGeojson(render));
}
