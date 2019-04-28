import * as at from 'fm3/actionTypes';

export function wsOpen() {
  return { type: at.WS_OPEN };
}

export function wsOpened() {
  return { type: at.WS_OPENED };
}

export function wsErrored() {
  return { type: at.WS_ERRORED };
}

export function wsClosed(code) {
  return { type: at.WS_CLOSED, payload: code };
}

export function wsReceived(message) {
  return { type: at.WS_RECEIVED, payload: message };
}

export function wsNotOpened() {
  return { type: at.WS_NOT_OPENED };
}

export function wsClose() {
  return { type: at.WS_CLOSE };
}

export function wsSend(message) {
  return { type: at.WS_SEND, payload: message };
}

export function wsAlreadyOpenedOrOpening() {
  return { type: at.WS_ALREADY_OPENED_OR_OPENING };
}
