import { createReducer } from '@reduxjs/toolkit';
import { toggleColorizeLegend } from '@shared/colorizers/colorizeSettings.js';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import {
  routePlannerColorizeBy,
  routePlannerPreventHint,
  routePlannerSetColorizeLegend,
} from './actions.js';

// Persisted route-planner display preferences. A dedicated settings slice (not
// the transient route state), so the colorize mode, legend toggle, and
// "don't hint again" flag survive map clears without per-handler preservation.
export interface RoutePlannerSettingsState {
  colorizeBy: ColorizingMode | null;
  // Whether the colorize legend is shown; independent of the other tools.
  colorizeLegend: boolean;
  preventHint: boolean;
}

export const routePlannerSettingsInitialState: RoutePlannerSettingsState = {
  colorizeBy: null,
  colorizeLegend: true,
  preventHint: false,
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
      }),
);
