import { createReducer } from '@reduxjs/toolkit';
import z from 'zod';
import { osmNotesSetListSort } from './actions.js';

/** How the layer's note list is ordered. */
export const OsmNotesListSortSchema = z.enum([
  'newest',
  'oldest',
  'active',
  'comments',
]);

export type OsmNotesListSort = z.infer<typeof OsmNotesListSortSchema>;

export interface OsmNotesSettingsState {
  /** The order of the layer's note list in the map layers panel. */
  listSort: OsmNotesListSort;
}

export const osmNotesSettingsInitialState: OsmNotesSettingsState = {
  listSort: 'newest',
};

export const osmNotesSettingsReducer = createReducer(
  osmNotesSettingsInitialState,
  (builder) =>
    builder.addCase(osmNotesSetListSort, (state, action) => {
      state.listSort = action.payload;
    }),
);
