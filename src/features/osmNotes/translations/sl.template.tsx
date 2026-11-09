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
  list: {
    sorts: {
      newest: 'Najnovejše najprej',
      oldest: 'Najstarejše najprej',
      active: 'Nazadnje aktivne najprej',
      comments: 'Največ komentarjev najprej',
    },
    none: 'V tem delu zemljevida ni odprtih opomb.',
    zoomIn: 'Za prikaz opomb povečajte zemljevid.',
    failed: 'Opomb ni bilo mogoče naložiti.',
    capped: ({ count }) =>
      `Navedenih je le prvih ${count} opomb v pogledu; za ostale povečajte zemljevid.`,
  },
};

export default sl;
