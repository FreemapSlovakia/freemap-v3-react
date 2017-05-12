const initialState = {
  trackGeojson: null,
  trackGpx: null,
  startPoints: [],
  finishPoints: [],
};

export default function trackViewer(state = initialState, action) {
  switch (action.type) {
    case 'TRACK_VIEWER_RESET_TRACK_DATA':
      return initialState;
    case 'TRACK_VIEWER_SET_TRACK_DATA':
      return {
        ...state,
        trackGpx: action.payload.trackGpx,
        trackGeojson: action.payload.trackGeojson,
        startPoints: action.payload.startPoints,
        finishPoints: action.payload.finishPoints,
      };
    default:
      return state;
  }
}
