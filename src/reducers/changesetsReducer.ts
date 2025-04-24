import { createReducer } from '@reduxjs/toolkit';
import {
  Changeset,
  changesetsSet,
  changesetsSetParams,
} from '../actions/changesetsActions.js';
import { clearMapFeatures, setTool } from '../actions/mainActions.js';

export interface ChangesetsState {
  changesets: Changeset[];
  days: number | null;
  authorName: string | null;
}

export const initialState: ChangesetsState = {
  changesets: [],
  days: null,
  authorName: null,
};

export const changesetReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(clearMapFeatures, () => initialState)
    .addCase(setTool, (_state, action) => ({
      ...initialState,
      days: action.payload === 'changesets' ? 3 : null,
    }))
    .addCase(changesetsSet, (state, action) => {
      state.changesets = action.payload;
    })
    .addCase(changesetsSetParams, (state, action) => {
      Object.assign(state, action.payload);
    }),
);
