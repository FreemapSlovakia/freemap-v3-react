import { createAction } from '@reduxjs/toolkit';

export const OSM_NOTE_ACTIONS = [
  'opened',
  'commented',
  'closed',
  'reopened',
  'hidden',
] as const;

export type OsmNoteAction = (typeof OSM_NOTE_ACTIONS)[number];

export interface OsmNoteComment {
  date: string;
  user?: string;
  action: OsmNoteAction;
  text: string;
}

export interface OsmNote {
  id: number;
  lat: number;
  lon: number;
  comments: OsmNoteComment[];
}

export const osmNotesSetNotes = createAction<OsmNote[]>('OSM_NOTES_SET_NOTES');

/** The selected note, once it is known — loaded by the layer or fetched alone. */
export const osmNotesSetSelected = createAction<OsmNote | null>(
  'OSM_NOTES_SET_SELECTED',
);
