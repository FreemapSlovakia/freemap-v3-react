import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const it: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
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
