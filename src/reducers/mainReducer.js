import * as at from 'fm3/actionTypes';

const initialState = {
  activeModal: null,
  tool: null,
  homeLocation: null,
  progress: [],
  location: null,
  expertMode: false,
  locate: false,
  selectingHomeLocation: false,
  urlUpdatingEnabled: false,
  errorTicketId: null,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case at.MAIN_LOAD_STATE: {
      const s = { ...state };
      const { homeLocation, expertMode } = action.payload;
      if (homeLocation && typeof homeLocation.lat === 'number' && typeof homeLocation.lon === 'number') {
        s.homeLocation = { lat: homeLocation.lat, lon: homeLocation.lon };
      }
      s.expertMode = !!expertMode;
      return s;
    }
    case at.AUTH_SET_USER: {
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
    case at.AUTH_LOGOUT:
      return { ...state, homeLocation: null };
    case at.SET_ACTIVE_MODAL:
      return { ...state, activeModal: action.payload };
    case at.SET_TOOL:
      return { ...state, tool: action.payload };
    case at.SET_HOME_LOCATION:
      return { ...state, homeLocation: action.payload ? { ...action.payload } : null };
    case at.START_PROGRESS:
      return { ...state, progress: [...state.progress, action.payload] };
    case at.STOP_PROGRESS:
      return { ...state, progress: state.progress.filter(pid => pid !== action.payload) };
    case at.SET_LOCATION:
      return { ...state, location: { lat: action.payload.lat, lon: action.payload.lon, accuracy: action.payload.accuracy } };
    case at.SET_EXPERT_MODE:
      return { ...state, expertMode: action.payload };
    case at.LOCATE:
      return { ...state, locate: !state.locate, location: null };
    case at.SET_SELECTING_HOME_LOCATION:
      return { ...state, selectingHomeLocation: action.payload };
    case at.TIPS_SHOW:
      return { ...state, activeModal: 'tips' };
    case at.ENABLE_UPDATING_URL:
      return { ...state, urlUpdatingEnabled: true };
    case at.SET_ERROR_TICKET_ID:
      return { ...state, errorTicketId: action.payload };
    default:
      return state;
  }
}
