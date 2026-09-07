import { clearMapFeatures, closeTool, openTool } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type Changeset,
  changesetsSet,
  changesetsSetLastFetchedBBox,
  changesetsSetParams,
} from './actions.js';

export interface ChangesetsState {
  changesets: Changeset[];
  days: number | null;
  authorName: string | null;
  lastFetchedBBox: string | null;
}

export const initialState: ChangesetsState = {
  changesets: [],
  days: null,
  authorName: null,
  lastFetchedBBox: null,
};

export const changesetReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    // Opening the tool starts a fresh 3-day query when none is set.
    .addCase(openTool, (state, action) =>
      action.payload === 'changesets' && state.days === null
        ? { ...initialState, days: 3 }
        : state,
    )
    // Closing the tool clears the changesets off the map. Keyed on this tool's
    // own close: another tool opening beside it says nothing about them.
    .addCase(closeTool, (state, action) =>
      action.payload === 'changesets' ? initialState : state,
    )
    .addCase(changesetsSet, (state, action) => {
      state.changesets = action.payload;
    })
    .addCase(changesetsSetParams, (state, action) => {
      Object.assign(state, action.payload);
    })
    .addCase(changesetsSetLastFetchedBBox, (state, action) => {
      state.lastFetchedBBox = action.payload;
    }),
);
