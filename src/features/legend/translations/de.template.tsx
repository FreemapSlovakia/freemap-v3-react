import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { LegendMessages } from './LegendMessages.js';

const de: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Kartenlegende für <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Unterkunft',
    'gastro-poi': 'Essen und Trinken',
    institution: 'Institutionen',
    sport: 'Sport',
    'natural-poi': 'Naturmerkmale',
    poi: 'Weitere Sehenswürdigkeiten',
    landcover: 'Landbedeckung',
    borders: 'Grenzen',
    'roads-and-paths': 'Straßen und Wege',
    railway: 'Eisenbahnen',
    terrain: 'Gelände',
    water: 'Wasser',
    other: 'Andere',
  },
};

export default de;
