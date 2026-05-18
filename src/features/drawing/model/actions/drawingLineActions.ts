import { Selection } from '@app/store/actions.js';
import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const PointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  id: z.number(),
});

export type Point = z.infer<typeof PointSchema>;

export const LineSchema = z.object({
  type: z.enum(['polygon', 'line']),
  points: z.array(PointSchema),
  label: z.string().optional(),
  color: z.string().optional(),
  width: z.number().optional(),
  dashArray: z.array(z.number()).optional(),
  lineCap: z.enum(['butt', 'round', 'square']).optional(),
  lineJoin: z.enum(['miter', 'round', 'bevel']).optional(),
});

export type Line = z.infer<typeof LineSchema>;

// Wire form for persisted maps: legacy `area` / `distance` line types
// are renamed to the current `polygon` / `line`.
export const LineCompatSchema = z.preprocess((v) => {
  if (typeof v === 'object' && v !== null && 'type' in v) {
    if (v.type === 'area') {
      return { ...v, type: 'polygon' };
    }

    if (v.type === 'distance') {
      return { ...v, type: 'line' };
    }
  }

  return v;
}, LineSchema);

export const drawingLineAdd = createAction<Line>('DRAWING_LINE_ADD');

export const drawingLineAddPoint = createAction<
  {
    point: Point;
    position?: number;
    indexOfLineToSelect: number;
  } & (
    | {
        lineIndex: number;
      }
    | {
        lineProps: {
          type: 'polygon' | 'line';
          color?: string;
          width?: number;
          dashArray?: number[];
          lineCap?: 'butt' | 'round' | 'square';
          lineJoin?: 'miter' | 'round' | 'bevel';
        };
      }
  )
>('DRAWING_LINE_ADD_POINT');

export const drawingLineChangeProperties = createAction<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
    width: number | undefined;
    type: 'line' | 'polygon';
    dashArray: number[] | undefined;
    lineCap: 'butt' | 'round' | 'square' | undefined;
    lineJoin: 'miter' | 'round' | 'bevel' | undefined;
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

export const drawingLineReverse = createAction<{
  lineIndex: number;
}>('DRAWING_LINE_REVERSE');

export const drawingLineSimplify = createAction<{
  lineIndex: number;
  tolerance: number;
}>('DRAWING_LINE_SIMPLIFY');
