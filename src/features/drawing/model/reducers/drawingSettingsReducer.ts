import { applySettings } from '@app/store/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { drawingLineChangeProperties } from '../actions/drawingLineActions.js';
import { drawingPointChangeProperties } from '../actions/drawingPointActions.js';

export interface DrawingSettingsState {
  drawingColor: string;
  drawingWidth: number;
  drawingRecentColors: string[];
}

export const drawingSettingsInitialState: DrawingSettingsState = {
  drawingColor: '#0000ff',
  drawingWidth: 4,
  drawingRecentColors: [],
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

        if (action.payload.drawingWidth) {
          state.drawingWidth = action.payload.drawingWidth;
        }

        if (color) {
          updateRecentDrawingColors(state, color);
        }
      })
      .addMatcher(
        isAnyOf(drawingLineChangeProperties, drawingPointChangeProperties),
        (state, { payload }) => {
          const color = payload.properties.color;

          return color ? updateRecentDrawingColors(state, color) : state;
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
