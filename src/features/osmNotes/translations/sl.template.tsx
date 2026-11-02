import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OsmNoteThread } from '../components/OsmNoteThread.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const sl: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  note: ({ note }) => <OsmNoteThread note={note} />,
  selection: 'Opomba OSM',
  showOnMap: 'prikaži na zemljevidu',
  anonymous: 'Anonimno',
  actions: {
    opened: 'Ustvarjena',
    commented: 'Komentar',
    closed: 'Zaprta',
    reopened: 'Ponovno odprta',
    hidden: 'Skrita',
  },
};

export default sl;
