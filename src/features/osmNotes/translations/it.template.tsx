import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OsmNoteThread } from '../components/OsmNoteThread.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const it: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  note: ({ note }) => <OsmNoteThread note={note} />,
  selection: 'Nota OSM',
  showOnMap: 'mostra sulla mappa',
  anonymous: 'Anonimo',
  actions: {
    opened: 'Creata',
    commented: 'Commento',
    closed: 'Chiusa',
    reopened: 'Riaperta',
    hidden: 'Nascosta',
  },
};

export default it;
