import { createStandardAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export const distanceMeasurementAddPoint = createStandardAction(
  'DISTANCE_MEASUREMENT_ADD_POINT',
)<{ point: Point; position?: number }>();

export const distanceMeasurementUpdatePoint = createStandardAction(
  'DISTANCE_MEASUREMENT_UPDATE_POINT',
)<{ index: number; point: Point }>();

export const distanceMeasurementRemovePoint = createStandardAction(
  'DISTANCE_MEASUREMENT_REMOVE_POINT',
)<number>();

export const distanceMeasurementSetPoints = createStandardAction(
  'DISTANCE_MEASUREMENT_SET_POINTS',
)<Point[]>();
