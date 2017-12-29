import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

export default createLogic({
  type: [at.ROUTE_PLANNER_TOGGLE_ELEVATION_CHART, at.ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX],
  process({ getState, action }, dispatch, done) {
    const shown = !!getState().elevationChart.trackGeojson;
    const toggling = action.type === at.ROUTE_PLANNER_TOGGLE_ELEVATION_CHART;
    if (toggling && shown) {
      dispatch(elevationChartClose());
    } else if (!shown && toggling || shown && !toggling) {
      const { alternatives, activeAlternativeIndex } = getState().routePlanner;
      dispatch(elevationChartSetTrackGeojson({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [].concat(...alternatives[activeAlternativeIndex].itinerary.map(({ shapePoints }) => shapePoints))
            .map(([lat, lon]) => [lon, lat]),
        },
      }));
    }
    done();
  },
});
