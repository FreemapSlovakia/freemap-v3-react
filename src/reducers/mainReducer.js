const initialState = {
  activePopup: null,
  tool: null,
  homeLocation: { lat: null, lon: null },
  progress: false,
  location: null,
  expertMode: false,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_POPUP':
      return { ...state, activePopup: action.payload };
    case 'CLOSE_POPUP':
      return { ...state, activePopup: null };
    case 'MAP_RESET':
      return { ...state, tool: null };
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
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
    default:
      return state;
  }
}
