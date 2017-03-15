import update from 'immutability-helper';

const initialState = {
  activePopup: null,
  tool: null
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_POPUP':
      return update(state, { activePopup: { $set: action.activePopup } });
    case 'CLOSE_POPUP':
      return update(state, { activePopup: { $set : null } });
    case 'SET_TOOL':
      return update(state, { $set: { tool: action.tool } });
    default:
      return state;
  }
}
