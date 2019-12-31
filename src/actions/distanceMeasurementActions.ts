import { createAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export interface Line {
  type: 'area' | 'distance';
  label?: string;
  points: Point[];
}

export const distanceMeasurementAddPoint = createAction(
  'DISTANCE_MEASUREMENT_ADD_POINT',
)<{
  type?: 'area' | 'distance';
  index?: number;
  point: Point;
  position?: number;
}>();

export const distanceMeasurementUpdatePoint = createAction(
  'DISTANCE_MEASUREMENT_UPDATE_POINT',
)<{ index: number; point: Point }>();

export const distanceMeasurementRemovePoint = createAction(
  'DISTANCE_MEASUREMENT_REMOVE_POINT',
)<{ index: number; id: number }>();

export const distanceMeasurementSetPoints = createAction(
  'DISTANCE_MEASUREMENT_SET_LINES',
)<Line[]>();
