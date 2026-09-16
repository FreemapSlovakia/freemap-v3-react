import {
  type DrawingStyle,
  makeDrawingStyle,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createReducer } from '@reduxjs/toolkit';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import { searchSetLabelVisibility, searchSetResultStyle } from './actions.js';

// Style for displayed search / map-details geometry. A dedicated, persisted
// settings slice (not the transient results), so it survives map clears.
// `window.fmHeadless.searchResultStyle` still takes precedence in the headless
// render.
export interface SearchSettingsState {
  resultStyle: DrawingStyle;
  labelVisibility: LabelVisibility;
}

export const searchSettingsInitialState: SearchSettingsState = {
  resultStyle: makeDrawingStyle('#3388ff', 5),
  labelVisibility: 'hover',
};

export const searchSettingsReducer = createReducer(
  searchSettingsInitialState,
  (builder) =>
    builder
      .addCase(searchSetResultStyle, (state, action) => {
        state.resultStyle = action.payload;
      })
      .addCase(searchSetLabelVisibility, (state, action) => {
        state.labelVisibility = action.payload;
      }),
);
