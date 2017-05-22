const initialState = {
  trackGeojson: null,
  activePoint: {
    lat: null,
    lon: null,
    ele: null,
    distanceFromStartInMeters: null,
  },
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
    case 'ELEVATION_CHART_CLOSE':
      return initialState;
    default:
      return state;
  }
}
