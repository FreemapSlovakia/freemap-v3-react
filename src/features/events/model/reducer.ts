import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type EventItem,
  type EventPoint,
  eventsConfirmPick,
  eventsOpen,
  eventsOpenDone,
  eventsSave,
  eventsSaveDone,
  eventsSetFilter,
  eventsSetList,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsSetPickRadius,
  eventsSetSelected,
  eventsStartPicked,
} from './actions.js';
import type { EventsFilter } from './filter.js';

export interface EventsState {
  list: EventItem[];
  filter: EventsFilter;
  selected: EventItem | null;
  /** The event whose map is loading, to select again once it has. */
  opening: { id: string; mapId: string } | null;
  pickingStart: boolean;
  /** The start point being placed while picking. */
  pickPosition: EventPoint | null;
  /** The confirmed pick, until the form takes it. */
  pickedStart: EventPoint | null;
  /** Km around the point, while picking a place to filter by; kept with the pick. */
  pickRadius: number | null;
  saving: boolean;
}

const initialState: EventsState = {
  list: [],
  filter: {},
  selected: null,
  opening: null,
  pickingStart: false,
  pickPosition: null,
  pickedStart: null,
  pickRadius: null,
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
    .addCase(eventsSetSelected, (state, { payload }) => {
      state.selected = payload;
    })
    .addCase(eventsOpen, (state, { payload }) => {
      state.opening = { id: payload.id, mapId: payload.mapId };
    })
    .addCase(eventsSave, (state) => {
      state.saving = true;
    })
    .addCase(eventsSaveDone, (state) => {
      state.saving = false;
    })
    .addCase(eventsOpenDone, (state) => {
      state.opening = null;
    })
    .addCase(eventsSetPickingStart, (state, { payload }) => {
      state.pickingStart = payload;

      if (!payload) {
        state.pickPosition = null;

        state.pickRadius = null;
      }
    })
    .addCase(eventsSetPickPosition, (state, { payload }) => {
      state.pickPosition = payload;
    })
    .addCase(eventsSetPickRadius, (state, { payload }) => {
      state.pickRadius = payload;
    })
    .addCase(eventsConfirmPick, (state) => {
      state.pickedStart = state.pickPosition;

      state.pickPosition = null;

      state.pickingStart = false;
    })
    // Picking belongs to the dialog that asked for it, which stays open
    // throughout; once another one opens (Back, a link) nobody takes the point.
    .addCase(setActiveModal, (state) => {
      state.pickingStart = false;

      state.pickPosition = null;

      state.pickedStart = null;

      state.pickRadius = null;
    })
    .addCase(eventsStartPicked, (state, { payload }) => {
      state.pickedStart = payload;

      if (!payload) {
        state.pickRadius = null;
      }
    });
});
