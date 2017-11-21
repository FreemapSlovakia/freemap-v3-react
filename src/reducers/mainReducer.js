const initialState = {
  activeModal: null,
  tool: null,
  homeLocation: null,
  progress: [],
  location: null,
  expertMode: false,
  locate: false,
  selectingHomeLocation: false,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'MAIN_LOAD_STATE': {
      const s = { ...state };
      const { homeLocation, expertMode } = action.payload;
      if (homeLocation && typeof homeLocation.lat === 'number' && typeof homeLocation.lon === 'number') {
        s.homeLocation = { lat: homeLocation.lat, lon: homeLocation.lon };
      }
      s.expertMode = !!expertMode;
      return s;
    }
    case 'AUTH_SET_USER': {
      const p = action.payload;
      return {
        ...state,
        homeLocation: !p ? state.homeLocation
          : p.lat && p.lon ? { lat: p.lat, lon: p.lon }
            : null,
        expertMode: p && p.settings && p.settings.expertMode !== undefined
          ? p.settings.expertMode : state.expertMode,
      };
    }
    case 'AUTH_LOGOUT':
      return { ...state, homeLocation: null };
    case 'SET_ACTIVE_MODAL':
      return { ...state, activeModal: action.payload };
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
    case 'SET_HOME_LOCATION':
      return { ...state, homeLocation: action.payload ? { ...action.payload } : null };
    case 'START_PROGRESS':
      return { ...state, progress: [...state.progress, action.payload] };
    case 'STOP_PROGRESS':
      return { ...state, progress: state.progress.filter(pid => pid !== action.payload) };
    case 'SET_LOCATION':
      return { ...state, location: { lat: action.payload.lat, lon: action.payload.lon, accuracy: action.payload.accuracy } };
    case 'SET_EXPERT_MODE':
      return { ...state, expertMode: action.payload };
    case 'LOCATE':
      return { ...state, locate: !state.locate, location: null };
    case 'SET_SELECTING_HOME_LOCATION':
      return { ...state, selectingHomeLocation: action.payload };
    default:
      return state;
  }
}
