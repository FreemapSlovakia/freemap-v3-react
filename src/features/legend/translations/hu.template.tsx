import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const hu: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Jelmagyarázat: <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Szállás',
    'gastro-poi': 'Étel és ital',
    institution: 'Intézmények',
    sport: 'Sport',
    'natural-poi': 'Természeti látnivalók',
    poi: 'Egyéb látnivalók',
    landcover: 'Felszínborítás',
    borders: 'Határok',
    'roads-and-paths': 'Utak és ösvények',
    railway: 'Vasút',
    terrain: 'Domborzat',
    water: 'Víz',
    other: 'Egyéb',
  },
};

export default hu;
