import { openTool, selectFeature } from '@app/store/actions.js';
import {
  drawingLineAdd,
  drawingLineDelete,
} from '@features/drawing/model/actions/drawingLineActions.js';
import {
  drawingMeasure,
  drawingPointAdd,
  drawingPointDelete,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { MarkerTypeSchema } from '@features/objects/model/actions.js';
import z from 'zod';
import { defineTool } from '../tool.js';

const LatLonSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

const ColorSchema = z
  .string()
  .optional()
  .describe('CSS hex colour, alpha allowed (#ff0000, #ff000080).');

export const drawingTools = [
  defineTool({
    name: 'add-marker',
    description:
      'Puts a labelled marker on the map. The icon is `poi:<name>` for a bundled map icon (e.g. `poi:peak`) or `fa:<name>` for a Font Awesome one; anything else shows as its first two characters.',
    input: z.object({
      ...LatLonSchema.shape,
      label: z.string().optional(),
      color: ColorSchema,
      markerType: MarkerTypeSchema.optional(),
      icon: z.string().optional(),
    }),
    execute({ lat, lon, label, color, markerType, icon }, { store }) {
      const { style } = store.getState().drawingSettings;

      store.dispatch(
        drawingPointAdd({
          coords: { lat, lon },
          label,
          color: color ?? style.color,
          markerType: markerType ?? style.markerType,
          icon,
          id: store.getState().drawingPoints.points.length,
        }),
      );

      store.dispatch(drawingMeasure({}));

      return { index: store.getState().drawingPoints.points.length - 1 };
    },
  }),

  defineTool({
    name: 'draw-line',
    description:
      'Draws a line through the given points. Use draw-area for a filled shape.',
    input: z.object({
      points: z.array(LatLonSchema).min(2),
      label: z.string().optional(),
      color: ColorSchema,
      width: z.number().min(1).max(20).optional(),
    }),
    execute({ points, label, color, width }, { store }) {
      const { style } = store.getState().drawingSettings;

      store.dispatch(
        drawingLineAdd({
          type: 'line',
          points: points.map((point, id) => ({ ...point, id })),
          label,
          color: color ?? style.color,
          width: width ?? style.width,
          dashArray: style.dashArray,
          lineCap: style.lineCap,
          lineJoin: style.lineJoin,
        }),
      );

      store.dispatch(drawingMeasure({}));

      return { index: store.getState().drawingLines.lines.length - 1 };
    },
  }),

  defineTool({
    name: 'draw-area',
    description:
      'Draws a filled area through the given points. The ring is closed on its own — do not repeat the first point.',
    input: z.object({
      points: z.array(LatLonSchema).min(3),
      label: z.string().optional(),
      color: ColorSchema,
      fillColor: ColorSchema,
    }),
    execute({ points, label, color, fillColor }, { store }) {
      const { style } = store.getState().drawingSettings;

      store.dispatch(
        drawingLineAdd({
          type: 'polygon',
          points: points.map((point, id) => ({ ...point, id })),
          label,
          color: color ?? style.color,
          fillColor: fillColor ?? style.fillColor,
          width: style.width,
          dashArray: style.dashArray,
          lineCap: style.lineCap,
          lineJoin: style.lineJoin,
        }),
      );

      store.dispatch(drawingMeasure({}));

      return { index: store.getState().drawingLines.lines.length - 1 };
    },
  }),

  defineTool({
    name: 'list-drawings',
    description:
      'Lists what is drawn on the map, with the index each one is removed by.',
    input: z.object({}),
    execute(_args, { store }) {
      const { drawingPoints, drawingLines } = store.getState();

      return {
        markers: drawingPoints.points.map((point, index) => ({
          index,
          label: point.label,
          ...point.coords,
        })),
        lines: drawingLines.lines.map((line, index) => ({
          index,
          type: line.type,
          label: line.label,
          points: line.points.length,
        })),
      };
    },
  }),

  defineTool({
    name: 'remove-drawing',
    description:
      'Removes one drawn marker, line or area by its index from list-drawings. Removing shifts the indexes of what comes after it, so list them again between removals.',
    input: z.object({
      kind: z.enum(['marker', 'line']),
      index: z.number().int().min(0),
    }),
    execute({ kind, index }, { store }) {
      const state = store.getState();

      const count =
        kind === 'marker'
          ? state.drawingPoints.points.length
          : state.drawingLines.lines.length;

      if (index >= count) {
        throw new Error(`There is no ${kind} ${index}; there are ${count}.`);
      }

      // As `deleteProcessor` does: what follows shifts into the deleted index,
      // and a selection left behind would then point at the wrong feature.
      store.dispatch(selectFeature(null));

      store.dispatch(
        kind === 'marker'
          ? drawingPointDelete({ index })
          : drawingLineDelete({ lineIndex: index }),
      );

      store.dispatch(drawingMeasure({}));
    },
  }),

  defineTool({
    name: 'open-drawing-tool',
    description:
      'Opens a drawing toolbar so the user can carry on by hand — clicking points onto the map, restyling or labelling what is drawn.',
    input: z.object({
      kind: z.enum(['draw-points', 'draw-lines', 'draw-polygons']),
    }),
    execute({ kind }, { store }) {
      store.dispatch(openTool(kind));
    },
  }),
];
