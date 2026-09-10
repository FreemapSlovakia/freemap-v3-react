import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const cs: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda k mapě <i>{name}</i>
    </>
  ),

  filter: 'Hledat v legendě',

  outdoorMap: {
    'roads-and-paths': 'Cesty a stezky',
    railway: 'Železnice',
    transport: 'Doprava',
    water: 'Voda',
    terrain: 'Terén',
    'natural-poi': 'Přírodní zajímavosti',
    landcover: 'Krajinný pokryv',
    borders: 'Hranice',
    accommodation: 'Ubytování a přístřešky',
    'gastro-poi': 'Jídlo a pití',
    shop: 'Obchody',
    sport: 'Sport a rekreace',
    tourism: 'Turistické zajímavosti',
    culture: 'Kultura a zábava',
    historic: 'Historické objekty',
    religion: 'Sakrální objekty',
    institution: 'Instituce',
    finance: 'Finance',
    health: 'Zdravotnictví',
    'man-made': 'Technické stavby',
    barrier: 'Zábrany',
    facility: 'Vybavenost',
    other: 'Ostatní',
  },
};

export default cs;
