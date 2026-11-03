import type { JSX } from 'react';
import type { OsmNote, OsmNoteAction } from '../model/actions.js';

export type OsmNotesMessages = {
  note: (props: { note: OsmNote }) => JSX.Element;
  selection: string;
  showOnMap: string;
  anonymous: string;
  actions: Record<OsmNoteAction, string>;
};
