import { applySettings } from '@app/store/actions.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { drawingLineChangeProperties } from '../actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '../actions/drawingPointActions.js';

export interface DrawingSettingsState {
  drawingColor: string;
  drawingFillColor?: string;
  drawingWidth: number;
  drawingRecentColors: string[];
  drawingDashArray?: number[];
  drawingLineCap?: 'butt' | 'round' | 'square';
  drawingLineJoin?: 'miter' | 'round' | 'bevel';
  drawingMarkerType: MarkerType;
}

export const drawingSettingsInitialState: DrawingSettingsState = {
  drawingColor: '#0000ff',
  drawingFillColor: '#0000ff33',
  drawingWidth: 4,
  drawingRecentColors: [],
  drawingMarkerType: 'pin',
};

export const drawingSettingsReducer = createReducer(
  drawingSettingsInitialState,
  (builder) =>
    builder
      .addCase(applySettings, (state, action) => {
        const color = action.payload.drawingColor;

        if (action.payload.drawingColor) {
          state.drawingColor = action.payload.drawingColor;
        }

        if ('drawingFillColor' in action.payload) {
          state.drawingFillColor = action.payload.drawingFillColor;
        }

        if (action.payload.drawingWidth) {
          state.drawingWidth = action.payload.drawingWidth;
        }

        if ('drawingDash' in action.payload) {
          state.drawingDashArray = action.payload.drawingDash;
        }

        if ('drawingLineCap' in action.payload) {
          state.drawingLineCap = action.payload.drawingLineCap;
        }

        if ('drawingLineJoin' in action.payload) {
          state.drawingLineJoin = action.payload.drawingLineJoin;
        }

        if (action.payload.drawingMarkerType) {
          state.drawingMarkerType = action.payload.drawingMarkerType;
        }

        if (color) {
          updateRecentDrawingColors(state, color);
        }

        const fillColor = action.payload.drawingFillColor;

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
  state: DrawingSettingsState,
  drawingColor: string,
) {
  state.drawingRecentColors = state.drawingRecentColors.filter(
    (color) => color !== drawingColor,
  );

  state.drawingRecentColors.unshift(drawingColor);

  state.drawingRecentColors.splice(12, Infinity);
}
