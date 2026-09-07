import {
  type DrawingStyle,
  makeDrawingStyle,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { createReducer } from '@reduxjs/toolkit';
import { toggleColorizeLegend } from '@shared/colorizers/colorizeSettings.js';
import {
  type ColorizingMode,
  colorizerNeedsElevation,
} from '@shared/colorizers/index.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { isTrackLine } from '../trackSelection.js';
import {
  dataViewerColorizeTrackBy,
  dataViewerSetColorizeLegend,
  dataViewerSetData,
  dataViewerSetStyle,
} from './actions.js';

// Persisted track-viewer display preferences. A dedicated settings slice (not
// the transient track data), so they survive map clears without per-handler
// preservation.
export interface DataViewerSettingsState {
  // Style applied to imported track-viewer features that carry no style of
  // their own.
  style: DrawingStyle;
  colorizeTrackBy: ColorizingMode | null;
  // Whether the colorize legend is shown; independent of the other tools.
  colorizeLegend: boolean;
}

export const dataViewerSettingsInitialState: DataViewerSettingsState = {
  style: makeDrawingStyle('#0000ff', 4),
  colorizeTrackBy: null,
  colorizeLegend: true,
};

export const dataViewerSettingsReducer = createReducer(
  dataViewerSettingsInitialState,
  (builder) =>
    builder
      .addCase(dataViewerSetStyle, (state, action) => {
        state.style = action.payload;
      })
      .addCase(dataViewerColorizeTrackBy, (state, action) => {
        state.colorizeTrackBy = action.payload;
      })
      .addCase(dataViewerSetColorizeLegend, (state, { payload }) => {
        toggleColorizeLegend(state, payload);
      })
      .addCase(dataViewerSetData, (state, action) => {
        // A persisted elevation-derived colorize mode would render as a flat
        // mid-palette on a track that lacks full elevation; drop it so the new
        // track starts uncolorized rather than in a misleading state. Cleared
        // in the same dispatch as the track data, so the URL/history sees one
        // atomic change.
        if (
          action.payload.trackGeojson &&
          state.colorizeTrackBy &&
          colorizerNeedsElevation(state.colorizeTrackBy) &&
          elevationCoverage(
            action.payload.trackGeojson.features.filter(isTrackLine),
          ) !== 'full'
        ) {
          state.colorizeTrackBy = null;
        }
      }),
);
