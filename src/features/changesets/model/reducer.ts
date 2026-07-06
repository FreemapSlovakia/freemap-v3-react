import { clearMapFeatures, setTool, setTools } from '@app/store/actions.js';
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
    // Opening the tool starts a fresh 3-day query; closing it clears the
    // changesets off the map, like photos.
    .addCase(setTool, (state, action) =>
      action.payload.tool === 'changesets'
        ? action.payload.mode === 'close'
          ? initialState
          : { ...initialState, days: 3 }
        : state,
    )
    // URL restore opens tools via setTools (and `[]` closes all) — apply the
    // same fresh-on-open / clear-on-absent behavior.
    .addCase(setTools, (state, action) =>
      action.payload.includes('changesets')
        ? state.days === null
          ? { ...initialState, days: 3 }
          : state
        : initialState,
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
