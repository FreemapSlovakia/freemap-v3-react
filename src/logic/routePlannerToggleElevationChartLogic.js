import { createLogic } from 'redux-logic';

import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

export default createLogic({
  type: ['ROUTE_PLANNER_TOGGLE_ELEVATION_CHART', 'ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX'],
  process({ getState, action }, dispatch, done) {
    const shown = !!getState().elevationChart.trackGeojson;
    if (action.type === 'ROUTE_PLANNER_TOGGLE_ELEVATION_CHART' && shown) {
      dispatch(elevationChartClose());
    } else if (!shown || action.type === 'ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX') {
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
