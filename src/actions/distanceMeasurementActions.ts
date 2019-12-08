import { createAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export const distanceMeasurementAddPoint = createAction(
  'DISTANCE_MEASUREMENT_ADD_POINT',
)<{ point: Point; position?: number }>();

export const distanceMeasurementUpdatePoint = createAction(
  'DISTANCE_MEASUREMENT_UPDATE_POINT',
)<{ point: Point }>();

export const distanceMeasurementRemovePoint = createAction(
  'DISTANCE_MEASUREMENT_REMOVE_POINT',
)<number>();

export const distanceMeasurementSetPoints = createAction(
  'DISTANCE_MEASUREMENT_SET_POINTS',
)<Point[]>();
