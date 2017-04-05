const initialState = {
  trackGeojson: null,
};

export default function trackViewer(state = initialState, action) {
  switch (action.type) {
    case 'TRACK_VIEWER_SET_TRACK_GEOJSON':
      return { ...state, trackGeojson: action.payload };
    default:
      return state;
  }
}
