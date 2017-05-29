const initialState = {
  trackGeojson: null,
  activePoint: {
    lat: null,
    lon: null,
    ele: null,
    distanceFromStartInMeters: null,
  },
  elevationProfilePoints: null,
};

export default function elevationChart(state = initialState, action) {
  switch (action.type) {
    case 'ELEVATION_CHART_SET_TRACK_GEOJSON':
      return { ...state, trackGeojson: action.payload.trackGeojson };
    case 'ELEVATION_CHART_SET_ACTIVE_POINT':
      return { ...state,
        activePoint: action.payload.activePoint,
      };
    case 'ELEVATION_CHART_REMOVE_ACTIVE_POINT':
      return { ...state, activePoint: initialState.activePoint };
    case 'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS':
      return { ...state, elevationProfilePoints: action.payload.elevationProfilePoints };
    case 'MAP_RESET':
    case 'SET_TOOL':
    case 'ROUTE_PLANNER_SET_RESULT':
    case 'DISTANCE_MEASUREMENT_ADD_POINT':
    case 'DISTANCE_MEASUREMENT_UPDATE_POINT':
    case 'DISTANCE_MEASUREMENT_REMOVE_POINT':
    case 'ELEVATION_CHART_CLOSE':
      return initialState;
    default:
      return state;
  }
}
