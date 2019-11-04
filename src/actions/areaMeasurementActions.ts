import { createAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export const areaMeasurementAddPoint = createAction(
  'AREA_MEASUREMENT_ADD_POINT',
)<{ point: Point; position?: number }>();

export const areaMeasurementUpdatePoint = createAction(
  'AREA_MEASUREMENT_UPDATE_POINT',
)<{ index: number; point: Point }>();

export const areaMeasurementRemovePoint = createAction(
  'AREA_MEASUREMENT_REMOVE_POINT',
)<number>();

export const areaMeasurementSetPoints = createAction(
  'AREA_MEASUREMENT_SET_POINTS',
)<Point[]>();
