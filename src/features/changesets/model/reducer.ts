import { clearMapFeatures, closeTool, openTool } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  type Changeset,
  changesetsHover,
  changesetsInspect,
  changesetsSet,
  changesetsSetLastFetchedBBox,
  changesetsSetParams,
} from './actions.js';

/** The Map changes tool's list; an inspection is `changesetInspector`'s. */
export interface ChangesetsState {
  changesets: Changeset[];
  days: number | null;
  authorName: string | null;
  lastFetchedBBox: string | null;
  /** The id of the changeset pointed at, outlined on the map. */
  hovered: number | null;
}

/** What the tool queries where no `days` is set. */
export const DEFAULT_DAYS = 3;

export const initialState: ChangesetsState = {
  changesets: [],
  days: null,
  authorName: null,
  lastFetchedBBox: null,
  hovered: null,
};

export const changesetReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    // Opening the tool starts a default query when none is set; closing it, or
    // clearing the map, left the rest at its initial state.
    .addCase(openTool, (state, action) => {
      if (action.payload === 'changesets') {
        state.days ??= DEFAULT_DAYS;
      }
    })
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
    })
    .addCase(changesetsHover, (state, action) => {
      state.hovered = action.payload;
    })
    // The markers and the list go, so no pointer leaves them.
    .addCase(changesetsInspect, (state) => {
      state.hovered = null;
    }),
);
