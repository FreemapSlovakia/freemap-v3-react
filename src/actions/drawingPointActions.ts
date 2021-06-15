import { createAction } from 'typesafe-actions';

export interface DrawingPoint {
  lat: number;
  lon: number;
  label?: string;
}

export const drawingPointAdd =
  createAction('DRAWING_POINT_ADD')<DrawingPoint>();

export const drawingPointChangePosition = createAction(
  'DRAWING_POINT_CHANGE_POSITION',
)<{ index: number; lat: number; lon: number }>();

export const drawingChangeLabel = createAction('DRAWING_CHANGE_LABEL')<{
  label: string | undefined;
}>();

export const drawingPointSetAll = createAction('DRAWING_POINT_SET_ALL')<
  DrawingPoint[]
>();

// NOTE used also for lines and polygons

export const drawingMeasure = createAction('DRAWING_MEASURE')<{
  elevation?: boolean;
  position?: { lat: number; lon: number };
}>();
