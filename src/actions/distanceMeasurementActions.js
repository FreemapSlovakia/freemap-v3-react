import * as at from 'fm3/actionTypes';

export function distanceMeasurementAddPoint(point, position) {
  return {
    type: at.DISTANCE_MEASUREMENT_ADD_POINT,
    payload: { point, position },
  };
}

export function distanceMeasurementUpdatePoint(index, point) {
  return {
    type: at.DISTANCE_MEASUREMENT_UPDATE_POINT,
    payload: { index, point },
  };
}

export function distanceMeasurementRemovePoint(id) {
  return { type: at.DISTANCE_MEASUREMENT_REMOVE_POINT, payload: id };
}

export function distanceMeasurementSetPoints(points) {
  return { type: at.DISTANCE_MEASUREMENT_SET_POINTS, payload: points };
}
