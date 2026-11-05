import type { OsmNoteAction } from '../model/actions.js';

export type OsmNotesMessages = {
  selection: string;
  showOnMap: string;
  anonymous: string;
  actions: Record<OsmNoteAction, string>;
};
