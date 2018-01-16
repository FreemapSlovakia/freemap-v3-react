import * as at from 'fm3/actionTypes';

const initialState = {
  reducingError: null,
  erroredAction: null,
  ticketId: null,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case at.ERROR_REDUCING_ERROR:
      return { ...state, reducingError: action.payload.error, erroredAction: action.payload.action };
    case at.ERROR_SET_TICKET_ID:
      return { ...state, ticketId: action.payload };
    case at.UNHANDLED_LOGIC_ERROR:
      return { ...state, reducingError: action.payload, erroredAction: null };
    default:
      return state;
  }
}
