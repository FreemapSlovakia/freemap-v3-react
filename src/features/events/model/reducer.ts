import { createReducer } from '@reduxjs/toolkit';
import {
  type EventItem,
  type EventsFilter,
  type EventsView,
  eventsSave,
  eventsSaveDone,
  eventsSetFilter,
  eventsSetList,
  eventsSetView,
} from './actions.js';

export interface EventsState {
  list: EventItem[];
  filter: EventsFilter;
  /**
   * Which half of the modal is up. In the slice rather than in the component
   * because the save decides it: the form stays up until the request lands, so
   * a refused save still has the typed values to retry from.
   */
  view: EventsView;
  saving: boolean;
}

const initialState: EventsState = {
  list: [],
  filter: {},
  view: 'list',
  saving: false,
};

export const eventsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(eventsSetList, (state, { payload }) => {
      state.list = payload;
    })
    .addCase(eventsSetFilter, (state, { payload }) => {
      state.filter = payload;
    })
    .addCase(eventsSetView, (state, { payload }) => {
      state.view = payload;
    })
    .addCase(eventsSave, (state) => {
      state.saving = true;
    })
    .addCase(eventsSaveDone, (state) => {
      state.saving = false;
    });
});
