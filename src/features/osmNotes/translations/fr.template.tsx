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
  list: {
    sorts: {
      newest: 'Les plus récentes d’abord',
      oldest: 'Les plus anciennes d’abord',
      active: 'Activité la plus récente d’abord',
      comments: 'Les plus commentées d’abord',
    },
    none: 'Aucune note ouverte dans cette partie de la carte.',
    zoomIn: 'Zoomez pour voir les notes.',
    failed: 'Les notes n’ont pas pu être chargées.',
    capped: ({ count }) =>
      `Seules les ${count} premières notes de la vue sont listées ; zoomez pour voir les autres.`,
  },
};

export default fr;
