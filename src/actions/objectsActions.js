import * as at from 'fm3/actionTypes';

export function objectsSetFilter(typeId) {
  return { type: at.OBJECTS_SET_FILTER, payload: typeId };
}

export function objectsSetResult(objects) {
  return { type: at.OBJECTS_SET_RESULT, payload: objects };
}
