import { createReducer } from '@reduxjs/toolkit';
import {
  type OsmNote,
  osmNotesSetNotes,
  osmNotesSetSelected,
} from './actions.js';

export interface OsmNotesState {
  notes: OsmNote[];
  selected: OsmNote | null;
}

const initialState: OsmNotesState = {
  notes: [],
  selected: null,
};

export const osmNotesReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(osmNotesSetNotes, (state, { payload }) => {
      state.notes = payload;
    })
    .addCase(osmNotesSetSelected, (state, { payload }) => {
      state.selected = payload;
    }),
);
