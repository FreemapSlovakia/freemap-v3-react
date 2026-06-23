import {
  clearMapFeatures,
  closeTool,
  setTool,
  setTools,
} from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  Changeset,
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
    // Opening the tool starts a fresh 3-day query; closing it (or closing all
    // tools via setTool(null)) clears the changesets off the map, like photos.
    .addCase(setTool, (state, action) =>
      action.payload === 'changesets'
        ? { ...initialState, days: 3 }
        : action.payload === null
          ? initialState
          : state,
    )
    // URL restore opens tools via setTools — apply the same fresh-on-open /
    // clear-on-absent behavior so a restored #tools=changesets actually loads.
    .addCase(setTools, (state, action) =>
      action.payload.includes('changesets')
        ? state.days === null
          ? { ...initialState, days: 3 }
          : state
        : initialState,
    )
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
