import { createReducer } from '@reduxjs/toolkit';
import { eventsColorizeBy, eventsToggleLegend } from './actions.js';
import type { EventsColorizeBy } from './colorize.js';

export interface EventsSettingsState {
  colorizeBy: EventsColorizeBy | null;
  showLegend: boolean;
}

export const eventsSettingsInitialState: EventsSettingsState = {
  colorizeBy: 'when',
  showLegend: true,
};

export const eventsSettingsReducer = createReducer(
  eventsSettingsInitialState,
  (builder) =>
    builder
      .addCase(eventsColorizeBy, (state, action) => {
        state.colorizeBy = action.payload;
      })
      .addCase(eventsToggleLegend, (state, action) => {
        state.showLegend = action.payload ?? !state.showLegend;
      }),
);
