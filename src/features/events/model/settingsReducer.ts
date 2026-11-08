import { createReducer } from '@reduxjs/toolkit';
import {
  eventsColorizeBy,
  eventsSetListInView,
  eventsSetListSort,
  eventsToggleLegend,
  eventsToggleListTrait,
} from './actions.js';
import type { EventsColorizeBy } from './colorize.js';
import {
  DEFAULT_LIST_TRAITS,
  type EventsListSort,
  type EventsListTrait,
} from './listSort.js';

export interface EventsSettingsState {
  colorizeBy: EventsColorizeBy | null;
  showLegend: boolean;
  /** The order of the layer's event list in the map layers panel. */
  listSort: EventsListSort;
  /** That list holds only the events within the map's view. */
  listInView: boolean;
  /** What each of its rows shows beside the dates. */
  listTraits: EventsListTrait[];
}

export const eventsSettingsInitialState: EventsSettingsState = {
  colorizeBy: 'when',
  showLegend: true,
  listSort: 'date',
  listInView: false,
  listTraits: DEFAULT_LIST_TRAITS,
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
      })
      .addCase(eventsToggleListTrait, (state, action) => {
        const trait = action.payload;

        state.listTraits = state.listTraits.includes(trait)
          ? state.listTraits.filter((t) => t !== trait)
          : [...state.listTraits, trait];
      }),
);
