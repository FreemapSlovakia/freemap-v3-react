import * as at from 'fm3/actionTypes';

const initialState = {
  state: 0,
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.WS_STATE_CHANGED:
      return { state: action.payload };
    default:
      return state;
  }
}
