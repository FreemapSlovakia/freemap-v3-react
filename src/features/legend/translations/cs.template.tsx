import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { LegendMessages } from './LegendMessages.js';

const cs: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda k mapě <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Ubytování',
    'gastro-poi': 'Jídlo a pití',
    institution: 'Instituce',
    sport: 'Sport',
    'natural-poi': 'Přírodní zajímavosti',
    poi: 'Ostatní zajímavosti',
    landcover: 'Krajinný pokryv',
    borders: 'Hranice',
    'roads-and-paths': 'Cesty a stezky',
    railway: 'Železnice',
    terrain: 'Terén',
    water: 'Voda',
    other: 'Ostatní',
  },
};

export default cs;
