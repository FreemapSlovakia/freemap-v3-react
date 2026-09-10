import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const fr: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Légende de la carte <i>{name}</i>
    </>
  ),

  filter: 'Rechercher dans la légende',

  outdoorMap: {
    'roads-and-paths': 'Routes et chemins',
    railway: 'Chemins de fer',
    transport: 'Transports',
    water: 'Eau',
    terrain: 'Relief',
    'natural-poi': 'Éléments naturels',
    landcover: 'Couverture du sol',
    borders: 'Frontières',
    accommodation: 'Hébergement et abris',
    'gastro-poi': 'Restauration',
    shop: 'Commerces',
    sport: 'Sports et loisirs',
    tourism: 'Tourisme',
    culture: 'Culture et divertissement',
    historic: 'Objets historiques',
    religion: 'Lieux de culte',
    institution: 'Institutions',
    finance: 'Finances',
    health: 'Santé',
    'man-made': 'Constructions',
    barrier: 'Barrières',
    facility: 'Équipements',
    other: 'Autres',
  },
};

export default fr;
