import { createAction } from 'typesafe-actions';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export interface Line {
  type: 'polygon' | 'line';
  label?: string;
  points: Point[];
}

export const drawingLineAddPoint = createAction('DRAWING_LINE_ADD_POINT')<{
  type?: 'polygon' | 'line';
  index?: number;
  point: Point;
  position?: number;
}>();

export const drawingLineUpdatePoint = createAction(
  'DRAWING_LINE_UPDATE_POINT',
)<{ index: number; point: Point }>();

export const drawingLineRemovePoint = createAction(
  'DRAWING_LINE_REMOVE_POINT',
)<{ index: number; id: number }>();

export const drawingLineSetLines = createAction('DRAWING_LINE_SET_LINES')<
  Line[]
>();
