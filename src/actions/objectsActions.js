export function objectsSetFilter(filter) {
  return { type: 'OBJECTS_SET_FILTER', payload: filter };
}

export function objectsSetResult(objects) {
  return { type: 'OBJECTS_SET_RESULT', payload: objects };
}
