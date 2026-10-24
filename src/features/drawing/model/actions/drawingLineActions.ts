import { createAction } from '@reduxjs/toolkit';
import z from 'zod';
import { DrawingPropsSchema } from './drawingPointActions.js';

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

/**
 * A line or polygon as the URL and a saved map's `lines` hold it — see
 * `dataViewer/drawingWire.ts`. Rings are stored open.
 */
export const LineSchema = z.object({
  type: DrawingLineTypeSchema,
  points: z.array(PointSchema),
  label: z.string().optional(),
  /** See {@link DrawingPropsSchema}. */
  props: DrawingPropsSchema.optional(),
  color: z.string().optional(),
  fillColor: z.string().optional(),
  width: z.number().optional(),
  dashArray: z.array(z.number()).optional(),
  lineCap: LineCapSchema.optional(),
  lineJoin: LineJoinSchema.optional(),
  /** Position, in the same list, of the polygon this ring is a hole of. */
  holeOf: z.number().int().nonnegative().optional(),
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

/** Stops the "draw the hole inside this polygon" hint from being shown again. */
export const drawingPreventCutHoleHint = createAction(
  'DRAWING_PREVENT_CUT_HOLE_HINT',
);
