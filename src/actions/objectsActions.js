export function objectsSetFilter(typeId) {
  return { type: 'OBJECTS_SET_FILTER', payload: typeId };
}

export function objectsSetResult(objects) {
  return { type: 'OBJECTS_SET_RESULT', payload: objects };
}

export function objectsExportGpx() {
  return { type: 'OBJECTS_EXPORT_GPX' };
}
