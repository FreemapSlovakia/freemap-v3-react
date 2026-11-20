import { createReducer } from '@reduxjs/toolkit';
import { toggleColorizeLegend } from '@shared/colorizers/colorizeSettings.js';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import { clamp } from '@shared/mathUtils.js';
import {
  type RoutePanelView,
  routePlannerColorizeBy,
  routePlannerPreventHint,
  routePlannerSetColorizeLegend,
  routePlannerSetMaxAlternatives,
  routePlannerSetPanelOpen,
  routePlannerSetPanelView,
  routePlannerSetStyle,
  routePlannerSetTurnByTurn,
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
  /**
   * How many routes to ask the router for, 1 to {@link MAX_ALTERNATIVES}. A
   * ceiling rather than a count: the router returns fewer where nothing else is
   * both near enough in time and different enough to be worth offering.
   */
  maxAlternatives: number;
  /** The route panel is open: changed only by opening or closing it. */
  panelOpen: boolean;
  /** The route panel's view, opened on next time. */
  panelView: RoutePanelView;
  /** The itinerary lists each leg's turns. */
  turnByTurn: boolean;
}

/** As many as the router is ever asked for; each one costs its own geometry. */
export const MAX_ALTERNATIVES = 5;

export const routePlannerSettingsInitialState: RoutePlannerSettingsState = {
  colorizeBy: null,
  colorizeLegend: true,
  preventHint: false,
  lineWidth: 6,
  lineOpacity: 1,
  markerOpacity: 1,
  maxAlternatives: 2,
  panelOpen: true,
  panelView: 'itinerary',
  turnByTurn: false,
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
      })
      .addCase(routePlannerSetMaxAlternatives, (state, { payload }) => {
        state.maxAlternatives = clamp(payload, 1, MAX_ALTERNATIVES);
      })
      .addCase(routePlannerSetPanelOpen, (state, { payload }) => {
        state.panelOpen = payload;
      })
      .addCase(routePlannerSetPanelView, (state, { payload }) => {
        state.panelView = payload;
      })
      .addCase(routePlannerSetTurnByTurn, (state, { payload }) => {
        state.turnByTurn = payload;
      }),
);
