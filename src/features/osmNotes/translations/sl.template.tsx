import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const sl: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
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
