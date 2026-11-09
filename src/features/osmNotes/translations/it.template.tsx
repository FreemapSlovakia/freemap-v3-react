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
  list: {
    sorts: {
      newest: 'Prima le più recenti',
      oldest: 'Prima le più vecchie',
      active: 'Prima le ultime attive',
      comments: 'Prima le più commentate',
    },
    none: 'Nessuna nota aperta in questa parte della mappa.',
    zoomIn: 'Ingrandisca la mappa per vedere le note.',
    failed: 'Non è stato possibile caricare le note.',
    capped: ({ count }) =>
      `Sono elencate solo le prime ${count} note nella vista; ingrandisca la mappa per le altre.`,
  },
};

export default it;
