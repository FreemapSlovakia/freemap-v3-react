import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import { lineString } from '@turf/helpers';
import {
  routePlannerSetActiveAlternativeIndex,
  routePlannerToggleElevationChart,
} from '../actions.js';
import { ensureRouteRenderGeojson } from '../ensureRouteRenderGeojson.js';

export const routePlannerToggleElevationChartProcessor: Processor<
  | typeof routePlannerToggleElevationChart
  | typeof routePlannerSetActiveAlternativeIndex
> = {
  actionCreator: [
    routePlannerToggleElevationChart,
    routePlannerSetActiveAlternativeIndex,
  ],
  handle: async ({ dispatch, getState, action }) => {
    const shown = Boolean(getState().elevationChart.elevationProfilePoints);

    const toggling = routePlannerToggleElevationChart.match(action);

    if (toggling && shown) {
      dispatch(elevationChartClose());
    } else if ((!shown && toggling) || (shown && !toggling)) {
      window._paq.push(['trackEvent', 'RoutePlanner', 'toggleElevationChart']);

      // Build the densified DEM render line so the chart isn't a coarse
      // straight-segment profile; a failure (e.g. offline) falls back to the
      // route's own coordinates.
      await ensureRouteRenderGeojson(getState, dispatch).catch(() => undefined);

      const { alternatives, activeAlternativeIndex, renderGeojson, points } =
        getState().routePlanner;

      const alternative = alternatives[activeAlternativeIndex];

      const fallbackCoords = alternative
        ? alternative.legs
            .flatMap((leg) => leg.steps)
            .flatMap((step) => step.geometry.coordinates)
        : [];

      const feature =
        renderGeojson ??
        (fallbackCoords.length >= 2 ? lineString(fallbackCoords) : null);

      if (!feature) {
        return;
      }

      // Mark the intermediate route points (midpoints) along the profile; the
      // start and finish are the chart's own endpoints, so they're omitted.
      const midpoints = points
        .slice(1, -1)
        .map(({ lat, lon }) => ({ lat, lon }));

      // Render the line's coordinates as-is rather than resampling a fresh
      // server profile.
      dispatch(elevationChartSetTrackGeojson(feature, true, midpoints));
    }
  },
};
