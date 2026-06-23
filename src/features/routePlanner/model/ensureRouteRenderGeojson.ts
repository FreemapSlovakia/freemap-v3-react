import { clearMapFeatures } from '@app/store/actions.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
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
 * caches it via {@link routePlannerSetRenderGeojson}. The router's own
 * elevation (a different DEM, sampled only at shape-point density) is ignored:
 * every vertex is overridden from our terrain model, then long segments are
 * densified at DEM resolution so the profile isn't a coarse straight line. Only
 * the elevation chart and elevation/steepness colorize read it; the source
 * `alternatives` stay GraphHopper's, so export and the drawn route are
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

  const [overridden] = await enrichElevations(
    [lineString(coordinates)],
    'all',
    getState,
    cancelActions,
  );

  const densified = await densifyAlong(overridden!, getState, cancelActions);

  // The route may have changed (or a concurrent call won) while sampling.
  const after = getState().routePlanner;

  if (
    after.renderGeojson ||
    after.alternatives[after.activeAlternativeIndex] !== alternative
  ) {
    return;
  }

  dispatch(routePlannerSetRenderGeojson(densified));
}
