import * as at from 'fm3/actionTypes';

export function infoPointAdd(lat, lon, label) {
  return { type: at.INFO_POINT_ADD, payload: { lat, lon, label } };
}

export function infoPointDelete() {
  return { type: at.INFO_POINT_DELETE };
}

export function infoPointChangePosition(lat, lon) {
  return { type: at.INFO_POINT_CHANGE_POSITION, payload: { lat, lon } };
}

export function infoPointChangeLabel(label) {
  return { type: at.INFO_POINT_CHANGE_LABEL, payload: label };
}

export function infoPointSetActiveIndex(index) {
  return { type: at.INFO_POINT_SET_ACTIVE_INDEX, payload: index };
}

export function infoPointSetAll(infoPoints) {
  return { type: at.INFO_POINT_SET_ALL, payload: infoPoints };
}
