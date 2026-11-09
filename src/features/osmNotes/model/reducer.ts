import { createReducer } from '@reduxjs/toolkit';
import {
  type OsmNote,
  type OsmNotesLoadState,
  osmNotesSetLoadState,
  osmNotesSetNotes,
  osmNotesSetSelected,
} from './actions.js';

export interface OsmNotesState {
  notes: OsmNote[];
  selected: OsmNote | null;
  loadState: OsmNotesLoadState;
}

const initialState: OsmNotesState = {
  notes: [],
  selected: null,
  loadState: 'unavailable',
};

export const osmNotesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(osmNotesSetNotes, (state, { payload }) => {
      state.notes = payload;
    })
    .addCase(osmNotesSetSelected, (state, { payload }) => {
      state.selected = payload;
    })
    .addCase(osmNotesSetLoadState, (state, { payload }) => {
      state.loadState = payload;
    }),
);
