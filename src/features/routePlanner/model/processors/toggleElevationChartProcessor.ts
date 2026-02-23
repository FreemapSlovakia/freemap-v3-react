import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { lineString } from '@turf/helpers';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '../../../elevationChart/model/actions.js';
import {
  routePlannerSetActiveAlternativeIndex,
  routePlannerToggleElevationChart,
} from '../actions.js';

export const routePlannerToggleElevationChartProcessor: Processor<
  | typeof routePlannerToggleElevationChart
  | typeof routePlannerSetActiveAlternativeIndex
> = {
  actionCreator: [
    routePlannerToggleElevationChart,
    routePlannerSetActiveAlternativeIndex,
  ],
  handle: async ({ dispatch, getState, action }) => {
    const shown = !!getState().elevationChart.elevationProfilePoints;

    const toggling = routePlannerToggleElevationChart.match(action);

    if (toggling && shown) {
      dispatch(elevationChartClose());
    } else if ((!shown && toggling) || (shown && !toggling)) {
      const { alternatives, activeAlternativeIndex } = getState().routePlanner;

      window._paq.push(['trackEvent', 'RoutePlanner', 'toggleElevationChart']);

      dispatch(
        elevationChartSetTrackGeojson(
          lineString(
            alternatives[activeAlternativeIndex].legs
              .flatMap((leg) => leg.steps)
              .flatMap((step) => step.geometry.coordinates),
          ),
        ),
      );
    }
  },
};
