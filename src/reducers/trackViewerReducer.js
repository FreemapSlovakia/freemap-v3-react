const initialState = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  startPoints: [],
  finishPoints: [],
  eleSmoothingFactor: 5,
  colorizeTrackBy: 'elevation',
};

export default function trackViewer(state = initialState, action) {
  switch (action.type) {
    case 'SET_TOOL':
    case 'CLEAR_MAP':
      return { ...initialState, eleSmoothingFactor: state.eleSmoothingFactor };
    case 'TRACK_VIEWER_LOAD_STATE': {
      const s = { ...state };
      const { eleSmoothingFactor } = action.payload;
      if (eleSmoothingFactor) {
        s.eleSmoothingFactor = eleSmoothingFactor;
      }
      return s;
    }
    case 'TRACK_VIEWER_SET_TRACK_DATA':
      return {
        ...state,
        trackGpx: action.payload.trackGpx,
        trackGeojson: action.payload.trackGeojson,
        startPoints: action.payload.startPoints,
        finishPoints: action.payload.finishPoints,
      };
    case 'TRACK_VIEWER_SET_TRACK_UID':
    case 'TRACK_VIEWER_DOWNLOAD_TRACK':
      return { ...state, trackUID: action.payload };
    case 'TRACK_VIEWER_SET_ELE_SMOOTHING_FACTOR':
      return { ...state, eleSmoothingFactor: action.payload };
    case 'TRACK_VIEWER_COLORIZE_TRACK_BY':
      return { ...state, colorizeTrackBy: action.payload };
    default:
      return state;
  }
}
