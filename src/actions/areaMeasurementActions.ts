import { createStandardAction } from 'typesafe-actions';

export interface IPoint {
  lat: number;
  lon: number;
  id: number;
}

export const areaMeasurementAddPoint = createStandardAction(
  'AREA_MEASUREMENT_ADD_POINT',
)<{ point: IPoint; position?: number }>();

export const areaMeasurementUpdatePoint = createStandardAction(
  'AREA_MEASUREMENT_UPDATE_POINT',
)<{ index: number; point: IPoint }>();

export const areaMeasurementRemovePoint = createStandardAction(
  'AREA_MEASUREMENT_REMOVE_POINT',
)<number>();

export const areaMeasurementSetPoints = createStandardAction(
  'AREA_MEASUREMENT_SET_POINTS',
)<IPoint[]>();
