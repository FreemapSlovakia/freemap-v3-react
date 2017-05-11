export function toastsAdd({ message, actions = [], timeout, style, collapseKey }) {
  const id = Math.random();
  return { type: 'TOASTS_ADD', payload: { id, message, actions, timeout, style, collapseKey } };
}

export function toastsRemove(id) {
  return { type: 'TOASTS_REMOVE', payload: id };
}

export function toastsStopTimeout(id) {
  return { type: 'TOASTS_STOP_TIMEOUT', payload: id };
}

export function toastsRestartTimeout(id) {
  return { type: 'TOASTS_RESTART_TIMEOUT', payload: id };
}
