import update from 'immutability-helper';

const initialState = {
  activePopup: null
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'SET_ACTIVE_POPUP':
      return update(state, { $set: { activePopup: action.activePopup } });
    case 'CLOSE_POPUP':
      return update(state, { $set: { activePopup: null } });
    default:
      return state;
  }
}
