import { applySettings } from '@app/store/actions.js';
import { MarkerTypeSchema } from '@features/objects/model/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import z from 'zod';
import {
  drawingLineChangeProperties,
  LineCapSchema,
  LineJoinSchema,
} from '../actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '../actions/drawingPointActions.js';

// The default style applied to newly drawn points/lines/polygons. Spread
// directly onto `drawingPointAdd`/`drawingLineAdd` payloads, so it must hold
// only style fields — `recentColors` (UI history) lives one level up.
export const DrawingStyleSchema = z.object({
  color: z.string(),
  width: z.number(),
  fillColor: z.string(),
  dashArray: z.number().array(),
  lineCap: LineCapSchema,
  lineJoin: LineJoinSchema,
  markerType: MarkerTypeSchema,
});

export type DrawingStyle = z.infer<typeof DrawingStyleSchema>;

/**
 * A default `DrawingStyle` from a base stroke color and width. The fill is the
 * same color at ~20% alpha. Shared by every default-style initial state.
 */
export function makeDrawingStyle(color: string, width: number): DrawingStyle {
  return {
    color,
    fillColor: color + '33',
    width,
    markerType: 'pin',
    dashArray: [],
    lineCap: 'round',
    lineJoin: 'round',
  };
}

const STYLE_KEYS = Object.keys(
  DrawingStyleSchema.shape,
) as (keyof DrawingStyle)[];

/**
 * Structural equality for two `DrawingStyle` values. Keys come from the schema
 * (so a new style field is covered automatically); the one array field
 * (`dashArray`) is compared element-wise, the rest are primitives.
 */
export function drawingStyleEquals(a: DrawingStyle, b: DrawingStyle): boolean {
  return STYLE_KEYS.every((key) => {
    const av = a[key];
    const bv = b[key];

    return Array.isArray(av) && Array.isArray(bv)
      ? av.length === bv.length && av.every((v, i) => v === bv[i])
      : av === bv;
  });
}

export const DrawingSettingsSchema = z.object({
  style: DrawingStyleSchema,
  recentColors: z.array(z.string()),
});

export type DrawingSettings = z.infer<typeof DrawingSettingsSchema>;

// Legacy persisted shape used flat `drawing*`-prefixed keys (drawingColor,
// drawingWidth, …). Rename them to the current style keys.
const LEGACY_KEY_MAP: Record<string, keyof DrawingStyle | 'recentColors'> = {
  drawingColor: 'color',
  drawingFillColor: 'fillColor',
  drawingWidth: 'width',
  drawingRecentColors: 'recentColors',
  drawingDashArray: 'dashArray',
  drawingLineCap: 'lineCap',
  drawingLineJoin: 'lineJoin',
  drawingMarkerType: 'markerType',
};

export const DrawingSettingsCompatSchema = z.preprocess(
  (s) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      return s;
    }

    const source = s as Record<string, unknown>;

    // Already in the current nested shape — leave it alone.
    if ('style' in source) {
      return source;
    }

    // Legacy/flat shape: lift `recentColors` to the top and nest the rest
    // under `style`.
    const style: Record<string, unknown> = {};

    let recentColors: unknown;

    for (const [key, value] of Object.entries(source)) {
      const mapped = LEGACY_KEY_MAP[key] ?? key;

      if (mapped === 'recentColors') {
        recentColors = value;
      } else {
        style[mapped] = value;
      }
    }

    return { style, recentColors };
  },
  z.object({
    style: DrawingStyleSchema.partial(),
    recentColors: z.array(z.string()).optional(),
  }),
);

export const drawingSettingsInitialState: DrawingSettings = {
  style: makeDrawingStyle('#0000ff', 4),
  recentColors: [],
};

export const drawingSettingsReducer = createReducer(
  drawingSettingsInitialState,
  (builder) =>
    builder
      .addCase(applySettings, (state, action) => {
        const { drawing } = action.payload;

        const color = drawing?.color;

        if (color) {
          state.style.color = color;
        }

        const fillColor = drawing?.fillColor;

        if (fillColor) {
          state.style.fillColor = fillColor;
        }

        if (drawing?.width) {
          state.style.width = drawing.width;
        }

        if (drawing?.dashArray) {
          state.style.dashArray = drawing.dashArray;
        }

        if (drawing?.lineCap) {
          state.style.lineCap = drawing.lineCap;
        }

        if (drawing?.lineJoin) {
          state.style.lineJoin = drawing.lineJoin;
        }

        if (drawing?.markerType) {
          state.style.markerType = drawing.markerType;
        }

        if (color) {
          updateRecentDrawingColors(state, color);
        }

        if (fillColor) {
          updateRecentDrawingColors(state, fillColor);
        }
      })
      .addMatcher(
        isAnyOf(drawingLineChangeProperties, drawingPointChangeProperties),
        (state, { payload }) => {
          const color = payload.properties.color;

          if (color) {
            updateRecentDrawingColors(state, color);
          }

          if (
            'fillColor' in payload.properties &&
            payload.properties.fillColor
          ) {
            updateRecentDrawingColors(state, payload.properties.fillColor);
          }

          return state;
        },
      ),
);

function updateRecentDrawingColors(
  state: DrawingSettings,
  drawingColor: string,
) {
  state.recentColors = state.recentColors.filter(
    (color) => color !== drawingColor,
  );

  state.recentColors.unshift(drawingColor);

  state.recentColors.splice(12, Infinity);
}
