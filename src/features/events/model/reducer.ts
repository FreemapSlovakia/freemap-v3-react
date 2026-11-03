import { createReducer } from '@reduxjs/toolkit';
import {
  type EventItem,
  type EventPoint,
  type EventsFilter,
  eventsOpen,
  eventsOpenDone,
  eventsSetFilter,
  eventsSetList,
  eventsSetPickingStart,
  eventsSetSelected,
  eventsStartPicked,
} from './actions.js';

export interface EventsState {
  list: EventItem[];
  filter: EventsFilter;
  selected: EventItem | null;
  /** The event whose map is loading, to select again once it has. */
  opening: string | null;
  pickingStart: boolean;
  pickedStart: EventPoint | null;
}

const initialState: EventsState = {
  list: [],
  filter: {},
  selected: null,
  opening: null,
  pickingStart: false,
  pickedStart: null,
};

export const eventsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(eventsSetList, (state, { payload }) => {
      state.list = payload;
    })
    .addCase(eventsSetFilter, (state, { payload }) => {
      state.filter = payload;
    })
    .addCase(eventsSetSelected, (state, { payload }) => {
      state.selected = payload;
    })
    .addCase(eventsOpen, (state, { payload }) => {
      state.opening = payload.mapId;
    })
    .addCase(eventsOpenDone, (state) => {
      state.opening = null;
    })
    .addCase(eventsSetPickingStart, (state, { payload }) => {
      state.pickingStart = payload;
    })
    .addCase(eventsStartPicked, (state, { payload }) => {
      state.pickedStart = payload;

      if (payload) {
        state.pickingStart = false;
      }
    });
});
