import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const fr: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Légende de la carte <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Hébergement',
    'gastro-poi': 'Restauration',
    institution: 'Institutions',
    sport: 'Sports',
    'natural-poi': 'Éléments naturels',
    poi: 'Autres points d’intérêt',
    landcover: 'Couverture du sol',
    water: 'Eau',
    'roads-and-paths': 'Routes et chemins',
    railway: 'Chemins de fer',
    terrain: 'Relief',
    borders: 'Frontières',
    other: 'Autres',
  },
};

export default fr;
