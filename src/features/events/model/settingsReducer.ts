import { createReducer } from '@reduxjs/toolkit';
import {
  eventsColorizeBy,
  eventsSetListInView,
  eventsSetListSort,
  eventsToggleLegend,
} from './actions.js';
import type { EventsColorizeBy } from './colorize.js';
import type { EventsListSort } from './listSort.js';

export interface EventsSettingsState {
  colorizeBy: EventsColorizeBy | null;
  showLegend: boolean;
  /** The order of the layer's event list in the map layers panel. */
  listSort: EventsListSort;
  /** That list holds only the events within the map's view. */
  listInView: boolean;
}

export const eventsSettingsInitialState: EventsSettingsState = {
  colorizeBy: 'when',
  showLegend: true,
  listSort: 'date',
  listInView: false,
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
      })
      .addCase(eventsSetListSort, (state, action) => {
        state.listSort = action.payload;
      })
      .addCase(eventsSetListInView, (state, action) => {
        state.listInView = action.payload;
      }),
);
