import * as at from 'fm3/actionTypes';

export function toastsAdd({ message, messageKey, messageParams, actions = [], timeout, style, collapseKey, cancelType }) {
  const id = Math.random();
  return {
    type: at.TOASTS_ADD,
    payload: {
      id, message, messageKey, actions, timeout, style, collapseKey, cancelType, messageParams,
    },
  };
}

export function toastsRemove(id) {
  return { type: at.TOASTS_REMOVE, payload: id };
}

export function toastsStopTimeout(id) {
  return { type: at.TOASTS_STOP_TIMEOUT, payload: id };
}

export function toastsRestartTimeout(id) {
  return { type: at.TOASTS_RESTART_TIMEOUT, payload: id };
}

// helpers

export function toastsAddError(messageKey, err, params = {}) {
  return toastsAdd({
    messageKey,
    messageParams: { ...params, ...(err ? { err: err.message } : {}) },
    style: 'danger',
    timeout: 5000,
  });
}
