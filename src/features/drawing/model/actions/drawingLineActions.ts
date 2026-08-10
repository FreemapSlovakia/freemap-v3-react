import type { Selection } from '@app/store/actions.js';
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
  /**
   * Position, in the same list, of the polygon this ring is a hole of. The wire
   * form of {@link DrawnLine.holeOfId} — neither the URL nor a saved document
   * carries line ids, so out here a hole names its parent by index.
   */
  holeOf: z.number().int().nonnegative().optional(),
});

export type Line = z.infer<typeof LineSchema>;

/**
 * A line as it lives in the store: a {@link Line} plus a stable `id`, assigned
 * by `drawingLinesReducer` on every path that puts one there.
 *
 * The id is deliberately absent from `LineSchema`, so it reaches neither the
 * URL (whose `line=`/`polygon=` params are positional) nor a persisted map —
 * already-saved documents carry none, and requiring one would fail their parse.
 * It exists because an array index is not an identity: deleting, splitting and
 * joining renumber the lines under anything that remembered one.
 */
export type DrawnLine = Omit<Line, 'holeOf'> & {
  id: number;
  /**
   * The `id` of the polygon this ring is a hole of. A hole is fully
   * subordinate: it is drawn, styled and measured as part of its parent, and
   * dies with it. Keyed by id rather than by the wire form's index for the same
   * reason `id` exists at all — every edit renumbers the lines.
   */
  holeOfId?: number;
};

/**
 * Each line's parent as the wire forms address it: a position in the same list.
 * Both the URL and a saved document carry hole membership this way, and both
 * must agree, or a map restored from its URL reads as changed.
 */
export function toWireHoleIndexes(
  lines: readonly DrawnLine[],
): (number | undefined)[] {
  const indexById = new Map(lines.map((line, i) => [line.id, i]));

  return lines.map((line) =>
    line.holeOfId === undefined ? undefined : indexById.get(line.holeOfId),
  );
}

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

/**
 * Appends one line, or a batch whose `holeOf` indexes address the batch itself
 * — how an imported polygon arrives with its holes attached.
 */
export const drawingLineAdd = createAction<Line | Line[]>('DRAWING_LINE_ADD');

export const drawingLineAddPoint = createAction<
  {
    point: Point;
    position?: number;
    indexOfLineToSelect: number;
    /** The point comes from interactive map drawing; enter/stay in drawing mode. */
    drawing?: boolean;
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

/**
 * Arms hole mode: the next polygon drawn becomes a hole of this one. Dispatch
 * it *after* opening the draw tool — opening a map-click tool disarms it, the
 * same way it drops a line being drawn.
 */
export const drawingLineCutHole = createAction<{
  parentLineIndex: number;
}>('DRAWING_LINE_CUT_HOLE');

/** Attaches an existing polygon to a parent as a hole, or (`undefined`) frees it. */
export const drawingLineSetHoleOf = createAction<{
  lineIndex: number;
  parentLineIndex: number | undefined;
}>('DRAWING_LINE_SET_HOLE_OF');

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
