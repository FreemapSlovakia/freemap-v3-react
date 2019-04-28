import * as at from 'fm3/actionTypes';


const initialState = {
  state: 'CLOSED',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case at.WS_OPENED:
      return { ...state, state: 'OPENED' };
    case at.WS_CLOSED:
      return { ...state, state: 'CLOSED' };
    case at.WS_CLOSE:
      return { ...state, state: 'CLOSING' };
    case at.WS_OPEN:
      return { ...state, state: 'OPENING' };
    default:
      return state;
  }
}
