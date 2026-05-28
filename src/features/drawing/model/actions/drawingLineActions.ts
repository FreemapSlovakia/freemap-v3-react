import { Selection } from '@app/store/actions.js';
import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const LineCapSchema = z.enum(['butt', 'round', 'square']);

export type LineCap = z.infer<typeof LineCapSchema>;

export const LineJoinSchema = z.enum(['miter', 'round', 'bevel']);

export type LineJoin = z.infer<typeof LineJoinSchema>;

export const DrawingLineTypeSchema = z.enum(['line', 'polygon']);

export type DrawingLineType = z.infer<typeof DrawingLineTypeSchema>;

export const isLineCap = (s: unknown): s is LineCap =>
  LineCapSchema.safeParse(s).success;

export const isLineJoin = (s: unknown): s is LineJoin =>
  LineJoinSchema.safeParse(s).success;

export const isDrawingLineType = (s: unknown): s is DrawingLineType =>
  DrawingLineTypeSchema.safeParse(s).success;

export const PointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  id: z.number(),
});

export type Point = z.infer<typeof PointSchema>;

export const LineSchema = z.object({
  type: DrawingLineTypeSchema,
  points: z.array(PointSchema),
  label: z.string().optional(),
  color: z.string().optional(),
  fillColor: z.string().optional(),
  width: z.number().optional(),
  dashArray: z.array(z.number()).optional(),
  lineCap: LineCapSchema.optional(),
  lineJoin: LineJoinSchema.optional(),
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
          type: DrawingLineType;
          color?: string;
          fillColor?: string;
          width?: number;
          dashArray?: number[];
          lineCap?: LineCap;
          lineJoin?: LineJoin;
        };
      }
  )
>('DRAWING_LINE_ADD_POINT');

export const drawingLineChangeProperties = createAction<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
    fillColor: string | undefined;
    width: number | undefined;
    type: DrawingLineType;
    dashArray: number[] | undefined;
    lineCap: LineCap | undefined;
    lineJoin: LineJoin | undefined;
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
