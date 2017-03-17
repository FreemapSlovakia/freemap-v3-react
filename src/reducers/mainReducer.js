const initialState = {
  activePopup: null,
  tool: null,
  homeLocation: { lat: null, lon: null },
  progress: false
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_POPUP':
      return Object.assign({}, state, { activePopup: action.activePopup });
    case 'CLOSE_POPUP':
      return Object.assign({}, state, { activePopup: null });
    case 'RESET_MAP':
      return Object.assign({}, state, { tool: null });
    case 'SET_TOOL':
      return Object.assign({}, state, { tool: action.tool });
    case 'SET_HOME_LOCATION':
      return Object.assign({}, state, { homeLocation: action.homeLocation });
    case 'START_PROGRESS':
      return Object.assign({}, state, { progress: true });
    case 'STOP_PROGRESS':
      return Object.assign({}, state, { progress: false });
    default:
      return state;
  }
}
