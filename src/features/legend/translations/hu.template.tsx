import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const hu: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Jelmagyarázat: <i>{name}</i>
    </>
  ),

  filter: 'Keresés a jelmagyarázatban',

  outdoorMap: {
    'roads-and-paths': 'Utak és ösvények',
    railway: 'Vasút',
    transport: 'Közlekedés',
    water: 'Víz',
    terrain: 'Domborzat',
    'natural-poi': 'Természeti látnivalók',
    landcover: 'Felszínborítás',
    borders: 'Határok',
    accommodation: 'Szállás és menedékek',
    'gastro-poi': 'Étel és ital',
    shop: 'Üzletek',
    sport: 'Sport és szabadidő',
    tourism: 'Turizmus',
    culture: 'Kultúra és szórakozás',
    historic: 'Történelmi objektumok',
    religion: 'Vallási helyek',
    institution: 'Intézmények',
    finance: 'Pénzügyek',
    health: 'Egészségügy',
    'man-made': 'Építmények',
    barrier: 'Akadályok',
    facility: 'Létesítmények',
    other: 'Egyéb',
  },
};

export default hu;
