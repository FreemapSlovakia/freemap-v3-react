export function setObjectsFilter(filter) {
  return { type: 'SET_OBJECTS_FILTER', payload: filter };
}

export function setObjects(objects) {
  return { type: 'SET_OBJECTS', payload: objects };
}
