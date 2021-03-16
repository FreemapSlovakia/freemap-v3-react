import { lineString } from '@turf/helpers';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import {
  routePlannerSetActiveAlternativeIndex,
  routePlannerToggleElevationChart,
} from 'fm3/actions/routePlannerActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const routePlannerToggleElevationChartProcessor: Processor<
  | typeof routePlannerToggleElevationChart
  | typeof routePlannerSetActiveAlternativeIndex
> = {
  actionCreator: [
    routePlannerToggleElevationChart,
    routePlannerSetActiveAlternativeIndex,
  ],
  handle: async ({ dispatch, getState, action }) => {
    const shown = !!getState().elevationChart.trackGeojson;

    const toggling = isActionOf(routePlannerToggleElevationChart, action);

    if (toggling && shown) {
      dispatch(elevationChartClose());
    } else if ((!shown && toggling) || (shown && !toggling)) {
      const { alternatives, activeAlternativeIndex } = getState().routePlanner;

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
