import type { RootState } from '@app/store/store.js';
import { createSelector } from 'reselect';

export const selectedOsmNoteId = ({ main: { selection } }: RootState) =>
  selection?.type === 'osm-note' ? selection.id : null;

/** The view's notes, and the selected one where it lies outside them, as from a link. */
export const shownOsmNotesSelector = createSelector(
  (state: RootState) => state.osmNotes.notes,
  (state: RootState) => state.osmNotes.selected,
  (notes, selected) =>
    selected && !notes.some((note) => note.id === selected.id)
      ? [...notes, selected]
      : notes,
);
