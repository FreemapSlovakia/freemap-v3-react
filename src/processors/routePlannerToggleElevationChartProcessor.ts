import { lineString } from '@turf/helpers';
import {
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';
import {
  routePlannerToggleElevationChart,
  routePlannerSetActiveAlternativeIndex,
} from 'fm3/actions/routePlannerActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const routePlannerToggleElevationChartProcessor: IProcessor<
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
            []
              .concat(
                ...alternatives[activeAlternativeIndex].itinerary.map(
                  ({ shapePoints }) => shapePoints,
                ),
              )
              .map(([lat, lon]) => [lon, lat]),
          ),
        ),
      );
    }
  },
};
