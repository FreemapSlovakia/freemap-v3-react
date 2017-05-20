const initialState = {
  trackGeojson: null,
};

export default function elevationChart(state = initialState, action) {
  switch (action.type) {
    case 'ELEVATION_CHART_SET_TRACK_GEOJSON':
      return { ...state, trackGeojson: action.payload.trackGeojson };
    case 'ELEVATION_CHART_CLOSE':
      return { ...state, trackGeojson: null };
    default:
      return state;
  }
}
