import * as at from 'fm3/actionTypes';

export function errorReducingError(action, error) {
  return { type: at.ERROR_REDUCING_ERROR, payload: { action, error } };
}

export function errorComponentError(error, componentStack) {
  return { type: at.ERROR_COMPONENT_ERROR, payload: { error, componentStack } };
}

export function errorSetTicketId(id) {
  return { type: at.ERROR_SET_TICKET_ID, payload: id };
}
