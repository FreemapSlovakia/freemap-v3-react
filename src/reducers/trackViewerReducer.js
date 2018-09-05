import * as at from 'fm3/actionTypes';

const initialState = {
  trackGeojson: null,
  trackGpx: null,
  trackUID: null,
  startPoints: [],
  finishPoints: [],
  colorizeTrackBy: null,
  gpxUrl: null, // TODO to separate reducer (?)

  osmNodeId: null,
  osmWayId: null,
  osmRelationId: null,
};

export default function trackViewer(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.TRACK_VIEWER_LOAD_STATE: {
      const s = { ...state };
      const { eleSmoothingFactor } = action.payload;
      if (eleSmoothingFactor) {
        s.eleSmoothingFactor = eleSmoothingFactor;
      }
      return s;
    }
    case at.TRACK_VIEWER_SET_TRACK_DATA:
      return {
        ...state,
        trackGpx: action.payload.trackGpx,
        trackGeojson: action.payload.trackGeojson,
        startPoints: action.payload.startPoints,
        finishPoints: action.payload.finishPoints,
      };
    case at.TRACK_VIEWER_SET_TRACK_UID:
    case at.TRACK_VIEWER_DOWNLOAD_TRACK:
      return { ...state, trackUID: action.payload };
    case at.TRACK_VIEWER_COLORIZE_TRACK_BY:
      return { ...state, colorizeTrackBy: action.payload };
    case at.TRACK_VIEWER_GPX_LOAD:
      return { ...state, gpxUrl: action.payload };

      // ----------

    case at.OSM_CLEAR:
      return initialState;
    case at.OSM_LOAD_NODE:
      return { ...state, osmNodeId: action.payload };
    case at.OSM_LOAD_WAY:
      return { ...state, osmWayId: action.payload };
    case at.OSM_LOAD_RELATION:
      return { ...state, osmRelationId: action.payload };
    default:
      return state;
  }
}
