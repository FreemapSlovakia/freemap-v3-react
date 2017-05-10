export function toastsAdd(message, actions) {
  const id = Math.random();
  return { type: 'TOASTS_ADD', payload: { message, id, actions } };
}

export function toastsRemove(id) {
  return { type: 'TOASTS_REMOVE', payload: id };
}
