import { createReducer } from '@reduxjs/toolkit';
import { toggleColorizeLegend } from '@shared/colorizers/colorizeSettings.js';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import { trackingActions } from './actions.js';

// Persisted tracking display preferences. A dedicated settings slice (not the
// transient devices/tracks state), so the colorize mode and legend toggle
// survive map clears without per-handler preservation.
export interface TrackingSettingsState {
  colorizeBy: ColorizingMode | null;
  // Whether the colorize legend is shown; independent of the other tools.
  colorizeLegend: boolean;
}

export const trackingSettingsInitialState: TrackingSettingsState = {
  colorizeBy: null,
  colorizeLegend: true,
};

export const trackingSettingsReducer = createReducer(
  trackingSettingsInitialState,
  (builder) =>
    builder
      .addCase(trackingActions.setColorizeBy, (state, { payload }) => {
        state.colorizeBy = payload;
      })
      .addCase(trackingActions.setColorizeLegend, (state, { payload }) => {
        toggleColorizeLegend(state, payload);
      }),
);
