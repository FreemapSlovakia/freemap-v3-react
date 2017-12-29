const initialState = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  startPoints: [],
  finishPoints: [],
  eleSmoothingFactor: 5,
  colorizeTrackBy: null,
  gpxUrl: null, // TODO to separate reducer (?)
  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
};

export default function trackViewer(state = initialState, action) {
  switch (action.type) {
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
    case 'TRACK_VIEWER_GPX_LOAD':
      return { ...state, gpxUrl: action.payload };
    case 'OSM_LOAD_NODE':
      return { ...state, osmNodeId: action.payload };
    case 'OSM_LOAD_WAY':
      return { ...state, osmWayId: action.payload };
    case 'OSM_LOAD_RELATION':
      return { ...state, osmRelationId: action.payload };
    case 'OSM_CLEAR':
      return { ...initialState, eleSmoothingFactor: state.eleSmoothingFactor };
    case 'AUTH_SET_USER': {
      const settings = action.payload && action.payload.settings;
      return settings ? {
        ...state,
        eleSmoothingFactor: settings.preventTips === undefined ? state.eleSmoothingFactor : settings.trackViewerEleSmoothingFactor,
      } : state;
    }
    default:
      return state;
  }
}
