import { OsmNoteThread } from '../components/OsmNoteThread.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const en: OsmNotesMessages = {
  note: ({ note }) => <OsmNoteThread note={note} />,
  selection: 'OSM note',
  showOnMap: 'show on map',
  anonymous: 'Anonymous',
  actions: {
    opened: 'Opened',
    commented: 'Comment',
    closed: 'Closed',
    reopened: 'Reopened',
    hidden: 'Hidden',
  },
};

export default en;
