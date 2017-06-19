const initialState = {
  activeModal: null,
  tool: null,
  homeLocation: { lat: null, lon: null },
  progress: false,
  location: null,
  expertMode: false,
  embeddedMode: false,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    // TODO improve validation
    case 'MAIN_LOAD_STATE': {
      const s = { ...state };
      const { homeLocation, expertMode } = action.payload;
      if (homeLocation) {
        s.homeLocation = { ...homeLocation };
      }
      if (expertMode) {
        s.expertMode = expertMode;
      }
      return s;
    }
    case 'ROUTE_PLANNER_SET_PARAMS':
      return { ...state, tool: 'route-planner' };
    case 'TRACK_VIEWER_DOWNLOAD_TRACK':
      return { ...state, tool: 'track-viewer' };
    case 'INFO_POINT_ADD':
      return { ...state, tool: 'info-point' };
    case 'SET_ACTIVE_MODAL':
      return { ...state, activeModal: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null };
    case 'MAP_RESET':
      return { ...state, tool: null };
    case 'SET_TOOL':
      return { ...state, tool: action.payload, progress: false };
    case 'SET_HOME_LOCATION':
      return { ...state, homeLocation: action.payload };
    case 'START_PROGRESS':
      return { ...state, progress: true };
    case 'STOP_PROGRESS':
      return { ...state, progress: false };
    case 'SET_LOCATION':
      return { ...state, location: { lat: action.payload.lat, lon: action.payload.lon, accuracy: action.payload.accuracy } };
    case 'SET_EXPERT_MODE':
      return { ...state, expertMode: action.payload };
    case 'SET_EMBEDDED_MODE':
      return { ...state, embeddedMode: true };
    default:
      return state;
  }
}
