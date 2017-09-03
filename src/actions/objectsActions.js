export function objectsSetFilter(typeId) {
  return { type: 'OBJECTS_SET_FILTER', payload: typeId };
}

export function objectsSetResult(objects) {
  return { type: 'OBJECTS_SET_RESULT', payload: objects };
}
