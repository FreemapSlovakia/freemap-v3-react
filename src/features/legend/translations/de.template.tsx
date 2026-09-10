import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const de: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Kartenlegende für <i>{name}</i>
    </>
  ),

  filter: 'Legende durchsuchen',

  outdoorMap: {
    'roads-and-paths': 'Straßen und Wege',
    railway: 'Eisenbahnen',
    transport: 'Verkehr',
    water: 'Wasser',
    terrain: 'Gelände',
    'natural-poi': 'Naturmerkmale',
    landcover: 'Landbedeckung',
    borders: 'Grenzen',
    accommodation: 'Unterkunft und Schutzhütten',
    'gastro-poi': 'Essen und Trinken',
    shop: 'Geschäfte',
    sport: 'Sport und Freizeit',
    tourism: 'Tourismus',
    culture: 'Kultur und Unterhaltung',
    historic: 'Historische Objekte',
    religion: 'Sakralbauten',
    institution: 'Institutionen',
    finance: 'Finanzen',
    health: 'Gesundheitswesen',
    'man-made': 'Bauwerke',
    barrier: 'Barrieren',
    facility: 'Einrichtungen',
    other: 'Andere',
  },
};

export default de;
