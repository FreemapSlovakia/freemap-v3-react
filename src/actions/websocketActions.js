import * as at from 'fm3/actionTypes';

export function wsOpen(tag) {
  return { type: at.WS_OPEN, payload: tag };
}

export function wsClose(tag) {
  return { type: at.WS_CLOSE, payload: tag };
}

export function wsSend(message, tag) {
  return { type: at.WS_SEND, payload: { message, tag } };
}

export function wsStateChanged(state, code) {
  return {
    type: at.WS_STATE_CHANGED,
    payload: { state, code, timestamp: Date.now() },
  };
}

export function wsClosed(code) {
  return { type: at.WS_CLOSED, payload: code };
}

export function wsReceived(message) {
  return { type: at.WS_RECEIVED, payload: message };
}

export function wsInvalidState(tag) {
  return { type: at.WS_INVALID_STATE, payload: tag };
}

// TODO to separate file
export function rpcCall(method, params, tag) {
  return { type: at.RPC_CALL, payload: { method, params, tag } };
}

export function rpcResponse(method, params, result, error, tag) {
  return {
    type: at.RPC_RESPONSE,
    payload: { method, params, result, error, tag },
  };
}

export function rpcEvent(method, params) {
  return { type: at.RPC_EVENT, payload: { method, params } };
}
