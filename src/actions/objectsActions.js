export function showObjectsModal() {
  return { type: 'SHOW_OBJECTS_MODAL' };
}

export function cancelObjectsModal() {
  return { type: 'CANCEL_OBJECTS_MODAL' };
}

export function setObjectsFilter(filter) {
  return { type: 'SET_OBJECTS_FILTER', filter };
}

export function setObjects(objects) {
  return { type: 'SET_OBJECTS', objects };
}
