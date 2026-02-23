import { createAction } from '@reduxjs/toolkit';
import { LatLon } from '../../../../types/common.js';

export interface DrawingPoint {
  coords: LatLon;
  label?: string;
  color?: string;
}

export const drawingPointAdd = createAction<DrawingPoint & { id: number }>(
  'DRAWING_POINT_ADD',
);

export const drawingPointChangePosition = createAction<{
  index: number;
  coords: LatLon;
}>('DRAWING_POINT_CHANGE_POSITION');

export const drawingPointChangeProperties = createAction<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
  };
}>('DRAWING_POINT_CHANGE_PROPERTIES');

export const drawingPointSetAll = createAction<DrawingPoint[]>(
  'DRAWING_POINT_SET_ALL',
);

// NOTE used also for lines and polygons

export const drawingMeasure = createAction<{
  elevation?: boolean;
  position?: LatLon;
}>('DRAWING_MEASURE');

export const drawingPointDelete = createAction<{
  index: number;
}>('DRAWING_POINT_DELETE');
