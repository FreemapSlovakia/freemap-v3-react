import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OsmNoteThread } from '../components/OsmNoteThread.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const hu: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  note: ({ note }) => <OsmNoteThread note={note} />,
  selection: 'OSM-jegyzet',
  showOnMap: 'megjelenítés a térképen',
  anonymous: 'Névtelen',
  actions: {
    opened: 'Létrehozva',
    commented: 'Hozzászólás',
    closed: 'Lezárva',
    reopened: 'Újranyitva',
    hidden: 'Elrejtve',
  },
};

export default hu;
