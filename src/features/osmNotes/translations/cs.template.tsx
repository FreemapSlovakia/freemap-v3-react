import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OsmNoteThread } from '../components/OsmNoteThread.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const cs: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  note: ({ note }) => <OsmNoteThread note={note} />,
  selection: 'Poznámka OSM',
  showOnMap: 'zobrazit na mapě',
  anonymous: 'Anonym',
  actions: {
    opened: 'Vytvořena',
    commented: 'Komentář',
    closed: 'Uzavřena',
    reopened: 'Znovu otevřena',
    hidden: 'Skryta',
  },
};

export default cs;
