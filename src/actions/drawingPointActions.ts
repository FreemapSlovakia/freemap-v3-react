import { createAction } from 'typesafe-actions';

export interface DrawingPoint {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
}

export const drawingPointAdd = createAction('DRAWING_POINT_ADD')<
  DrawingPoint & { id: number }
>();

export const drawingPointChangePosition = createAction(
  'DRAWING_POINT_CHANGE_POSITION',
)<{ index: number; lat: number; lon: number }>();

export const drawingPointChangeProperties = createAction(
  'DRAWING_POINT_CHANGE_PROPERTIES',
)<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
  };
}>();

export const drawingPointSetAll = createAction('DRAWING_POINT_SET_ALL')<
  DrawingPoint[]
>();

// NOTE used also for lines and polygons

export const drawingMeasure = createAction('DRAWING_MEASURE')<{
  elevation?: boolean;
  position?: { lat: number; lon: number };
}>();

export const drawingPointDelete = createAction('DRAWING_POINT_DELETE')<{
  index: number;
}>();
