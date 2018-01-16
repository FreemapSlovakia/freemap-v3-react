import * as at from 'fm3/actionTypes';

// export function errorSetError(action, error) {
//   return { type: at.ERROR_SET_ERROR, payload: { action, error } };
// }

export function errorSetTicketId(id) {
  return { type: at.ERROR_SET_TICKET_ID, payload: id };
}
