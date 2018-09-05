import * as at from 'fm3/actionTypes';

const initialState = {
  trackGeojson: null,
  activePoint: {
    lat: null,
    lon: null,
    ele: null,
    distance: null,
  },
  elevationProfilePoints: null,
};

export default function elevationChart(state = initialState, action) {
  switch (action.type) {
    case at.ELEVATION_CHART_SET_TRACK_GEOJSON:
      return { ...state, trackGeojson: action.payload.trackGeojson };
    case at.ELEVATION_CHART_SET_ACTIVE_POINT:
      return {
        ...state,
        activePoint: action.payload.activePoint,
      };
    case at.ELEVATION_CHART_REMOVE_ACTIVE_POINT:
      return { ...state, activePoint: initialState.activePoint };
    case at.ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS:
      return { ...state, elevationProfilePoints: action.payload.elevationProfilePoints };
    case at.SET_TOOL:
    case at.ROUTE_PLANNER_SET_RESULT:
    case at.DISTANCE_MEASUREMENT_ADD_POINT:
    case at.DISTANCE_MEASUREMENT_UPDATE_POINT:
    case at.DISTANCE_MEASUREMENT_REMOVE_POINT:
    case at.ELEVATION_CHART_CLOSE:
      return initialState;
    default:
      return state;
  }
}
