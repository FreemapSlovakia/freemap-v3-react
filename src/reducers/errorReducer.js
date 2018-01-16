import * as at from 'fm3/actionTypes';

const initialState = {
  // error: null,
  // action: null,
  ticketId: null,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    // case at.ERROR_SET_ERROR:
    //   return { ...state, error: action.payload.error, action: action.payload.action };
    // case at.UNHANDLED_LOGIC_ERROR:
    //   return { ...state, error: action.payload, action: null };
    case at.ERROR_SET_TICKET_ID:
      return { ...state, ticketId: action.payload };
    default:
      return state;
  }
}
