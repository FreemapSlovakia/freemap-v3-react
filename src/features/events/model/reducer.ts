import { createReducer } from '@reduxjs/toolkit';
import {
  type EventItem,
  type EventsFilter,
  eventsSetFilter,
  eventsSetList,
} from './actions.js';

export interface EventsState {
  list: EventItem[];
  filter: EventsFilter;
}

const initialState: EventsState = {
  list: [],
  filter: {},
};

export const eventsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(eventsSetList, (state, { payload }) => {
      state.list = payload;
    })
    .addCase(eventsSetFilter, (state, { payload }) => {
      state.filter = payload;
    });
});
