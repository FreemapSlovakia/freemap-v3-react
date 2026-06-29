import {
  type DrawingStyle,
  makeDrawingStyle,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createReducer } from '@reduxjs/toolkit';
import { trackViewerSetStyle } from './actions.js';

// Style applied to imported track-viewer features that carry no style of their
// own. A dedicated, persisted settings slice (not the transient track data), so
// it survives map clears without per-handler preservation.
export interface TrackViewerSettingsState {
  style: DrawingStyle;
}

export const trackViewerSettingsInitialState: TrackViewerSettingsState = {
  style: makeDrawingStyle('#0000ff', 4),
};

export const trackViewerSettingsReducer = createReducer(
  trackViewerSettingsInitialState,
  (builder) =>
    builder.addCase(trackViewerSetStyle, (state, action) => {
      state.style = action.payload;
    }),
);
