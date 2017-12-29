import * as at from 'fm3/actionTypes';

export function areaMeasurementAddPoint(point, position) {
  return { type: at.AREA_MEASUREMENT_ADD_POINT, payload: { point, position } };
}

export function areaMeasurementUpdatePoint(index, point) {
  return { type: at.AREA_MEASUREMENT_UPDATE_POINT, payload: { index, point } };
}

export function areaMeasurementRemovePoint(id) {
  return { type: at.AREA_MEASUREMENT_REMOVE_POINT, payload: id };
}

export function areaMeasurementSetPoints(points) {
  return { type: at.AREA_MEASUREMENT_SET_POINTS, payload: points };
}
