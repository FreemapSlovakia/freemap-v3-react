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
import { ensureRouteElevations } from '../ensureRouteElevations.js';

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

      // Fill missing elevations from the terrain model so the chart renders
      // complete local data; a failure (e.g. offline) just leaves the gaps.
      await ensureRouteElevations(getState, dispatch).catch(() => undefined);

      const { alternatives, activeAlternativeIndex } = getState().routePlanner;

      const alternative = alternatives[activeAlternativeIndex];

      if (!alternative) {
        return;
      }

      // Render the route's own coordinates as-is (gaps included) rather than
      // resampling a fresh server profile.
      dispatch(
        elevationChartSetTrackGeojson(
          lineString(
            alternative.legs
              .flatMap((leg) => leg.steps)
              .flatMap((step) => step.geometry.coordinates),
          ),
          true,
        ),
      );
    }
  },
};
