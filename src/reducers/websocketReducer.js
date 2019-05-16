import * as at from 'fm3/actionTypes';

const initialState = {
  state: 3,
  code: 1000,
  timestamp: 0,
};

export default function tracking(state = initialState, action) {
  switch (action.type) {
    case at.WS_STATE_CHANGED:
      return {
        state: action.payload.state,
        code: action.payload.code,
        timestamp: action.payload.timestamp,
      };
    default:
      return state;
  }
}
