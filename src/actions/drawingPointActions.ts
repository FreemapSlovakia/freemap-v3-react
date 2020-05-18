import { createAction } from 'typesafe-actions';

export interface DrawingPoint {
  lat: number;
  lon: number;
  label?: string;
}

export const drawingPointAdd = createAction('DRAWING_POINT_ADD')<
  DrawingPoint
>();

export const drawingPointChangePosition = createAction(
  'DRAWING_POINT_CHANGE_POSITION',
)<{ index: number; lat: number; lon: number }>();

export const drawingChangeLabel = createAction('DRAWING_CHANGE_LABEL')<{
  label: string | undefined;
}>();

export const drawingPointSetAll = createAction('DRAWING_POINT_SET_ALL')<
  DrawingPoint[]
>();

export const drawingPointMeasure = createAction('DRAWING_POINT_MEASURE')<
  boolean
>();
