import { Selection } from './mainActions';
import { createAction } from '@reduxjs/toolkit';

export interface Point {
  lat: number;
  lon: number;
  id: number;
}

export interface Line {
  type: 'polygon' | 'line';
  points: Point[];
  label?: string;
  color?: string;
  width?: number;
}

export const drawingLineAdd = createAction<Line>('DRAWING_LINE_ADD');

export const drawingLineAddPoint = createAction<{
  type?: 'polygon' | 'line';
  index?: number;
  color?: string;
  width?: number;
  point: Point;
  position?: number;
  id: number;
}>('DRAWING_LINE_ADD_POINT');

export const drawingLineChangeProperties = createAction<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
    width: number | undefined;
    type: 'line' | 'polygon';
  };
}>('DRAWING_LINE_CHANGE_PROPERTIES');

export const drawingLineUpdatePoint = createAction<{
  index: number;
  point: Point;
}>('DRAWING_LINE_UPDATE_POINT');

export const drawingLineRemovePoint = createAction<{
  index: number;
  id: number;
}>('DRAWING_LINE_REMOVE_POINT');

export const drawingLineSetLines = createAction<Line[]>(
  'DRAWING_LINE_SET_LINES',
);

export const drawingLineSplit = createAction<{
  lineIndex: number;
  pointId: number;
}>('DRAWING_LINE_SPLIT');

export const drawingLineJoinStart = createAction<
  | undefined
  | {
      lineIndex: number;
      pointId: number;
    }
>('DRAWING_LINE_JOIN_START');

export const drawingLineJoinFinish = createAction<{
  lineIndex: number;
  pointId: number;
  selection: Selection;
}>('DRAWING_LINE_JOIN_FINISH');

export const drawingLineContinue = createAction<{
  lineIndex: number;
  pointId: number;
}>('DRAWING_LINE_CONTINUE');

export const drawingLineStopDrawing = createAction('DRAWING_LINE_STOP_DRAWING');

export const drawingLineDelete = createAction<{
  lineIndex: number;
}>('DRAWING_LINE_DELETE');

export const drawingLineDeletePoint = createAction<{
  lineIndex: number;
  pointId: number;
}>('DRAWING_LINE_DELETE_POINT');
