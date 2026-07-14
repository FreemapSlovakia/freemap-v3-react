import { createReducer } from '@reduxjs/toolkit';
import { toggleColorizeLegend } from '@shared/colorizers/colorizeSettings.js';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import {
  routePlannerColorizeBy,
  routePlannerPreventHint,
  routePlannerSetColorizeLegend,
  routePlannerSetStyle,
} from './actions.js';

// Persisted route-planner display preferences. A dedicated settings slice (not
// the transient route state), so the colorize mode, legend toggle, "don't hint
// again" flag, and route line/marker style survive map clears without
// per-handler preservation.
export interface RoutePlannerSettingsState {
  colorizeBy: ColorizingMode | null;
  // Whether the colorize legend is shown; independent of the other tools.
  colorizeLegend: boolean;
  preventHint: boolean;
  // Width of the route line in pixels.
  lineWidth: number;
  // Opacity of the route line (and its outline), 0–1.
  lineOpacity: number;
  // Opacity of the start/finish/midpoint markers, 0–1.
  markerOpacity: number;
}

export const routePlannerSettingsInitialState: RoutePlannerSettingsState = {
  colorizeBy: null,
  colorizeLegend: true,
  preventHint: false,
  lineWidth: 6,
  lineOpacity: 1,
  markerOpacity: 1,
};

export const routePlannerSettingsReducer = createReducer(
  routePlannerSettingsInitialState,
  (builder) =>
    builder
      .addCase(routePlannerColorizeBy, (state, action) => {
        state.colorizeBy = action.payload;
      })
      .addCase(routePlannerSetColorizeLegend, (state, { payload }) => {
        toggleColorizeLegend(state, payload);
      })
      .addCase(routePlannerPreventHint, (state) => {
        state.preventHint = true;
      })
      .addCase(routePlannerSetStyle, (state, { payload }) => {
        state.lineWidth = payload.lineWidth;
        state.lineOpacity = payload.lineOpacity;
        state.markerOpacity = payload.markerOpacity;
      }),
);
