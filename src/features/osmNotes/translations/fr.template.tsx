import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const fr: DeepPartialWithRequiredObjects<OsmNotesMessages> = {
  selection: 'Note OSM',
  showOnMap: 'afficher sur la carte',
  anonymous: 'Anonyme',
  actions: {
    opened: 'Créée',
    commented: 'Commentaire',
    closed: 'Fermée',
    reopened: 'Rouverte',
    hidden: 'Masquée',
  },
};

export default fr;
