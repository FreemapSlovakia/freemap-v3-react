import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const pl: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'Uwaga OSM',
  showOnMap: 'pokaż na mapie',
  anonymous: 'Anonim',
  actions: {
    opened: 'Utworzona',
    commented: 'Komentarz',
    closed: 'Zamknięta',
    reopened: 'Ponownie otwarta',
    hidden: 'Ukryta',
  },
};

export default pl;
