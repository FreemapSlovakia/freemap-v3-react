import { createStandardAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export const areaMeasurementAddPoint = createStandardAction(
  'AREA_MEASUREMENT_ADD_POINT',
)<{ point: Point; position?: number }>();

export const areaMeasurementUpdatePoint = createStandardAction(
  'AREA_MEASUREMENT_UPDATE_POINT',
)<{ index: number; point: Point }>();

export const areaMeasurementRemovePoint = createStandardAction(
  'AREA_MEASUREMENT_REMOVE_POINT',
)<number>();

export const areaMeasurementSetPoints = createStandardAction(
  'AREA_MEASUREMENT_SET_POINTS',
)<Point[]>();
