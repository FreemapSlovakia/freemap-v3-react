import update from 'immutability-helper';

const initialState = {
  activePopup: null,
  tool: null,
  homeLocation: { lat: null, lon: null }
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_POPUP':
      return update(state, { activePopup: { $set: action.activePopup } });
    case 'CLOSE_POPUP':
      return update(state, { activePopup: { $set: null } });
    case 'SET_TOOL':
      return update(state, { tool: { $set: action.tool } });
    case 'SET_HOME_LOCATION':
      return update(state, { homeLocation: { $set: action.homeLocation } });
    default:
      return state;
  }
}
