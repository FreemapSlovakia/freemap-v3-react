import type { OsmNoteAction } from '../model/actions.js';
import type { OsmNotesListSort } from '../model/settingsReducer.js';

export type OsmNotesMessages = {
  selection: string;
  showOnMap: string;
  anonymous: string;
  actions: Record<OsmNoteAction, string>;
  /** The layer's note list in the map layers panel. */
  list: {
    sorts: Record<OsmNotesListSort, string>;
    none: string;
    zoomIn: string;
    failed: string;
    /** The API's cap on notes per request was reached. */
    capped: (params: { count: number }) => string;
  };
};
