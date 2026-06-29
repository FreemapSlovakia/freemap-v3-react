import {
  type DrawingStyle,
  makeDrawingStyle,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createReducer } from '@reduxjs/toolkit';
import { searchSetResultStyle } from './actions.js';

// Style for displayed search / map-details geometry. A dedicated, persisted
// settings slice (not the transient results), so it survives map clears.
// `window.fmHeadless.searchResultStyle` still takes precedence in the headless
// render.
export interface SearchSettingsState {
  resultStyle: DrawingStyle;
}

export const searchSettingsInitialState: SearchSettingsState = {
  resultStyle: makeDrawingStyle('#3388ff', 5),
};

export const searchSettingsReducer = createReducer(
  searchSettingsInitialState,
  (builder) =>
    builder.addCase(searchSetResultStyle, (state, action) => {
      state.resultStyle = action.payload;
    }),
);
