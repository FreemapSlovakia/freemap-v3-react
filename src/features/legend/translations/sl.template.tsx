import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const sl: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda zemljevida <i>{name}</i>
    </>
  ),

  filter: 'Iskanje po legendi',

  outdoorMap: {
    'roads-and-paths': 'Ceste in poti',
    railway: 'Železnice',
    transport: 'Promet',
    water: 'Voda',
    terrain: 'Relief',
    'natural-poi': 'Naravne značilnosti',
    landcover: 'Pokrovnost tal',
    borders: 'Meje',
    accommodation: 'Nastanitve in zavetišča',
    'gastro-poi': 'Hrana in pijača',
    shop: 'Trgovine',
    sport: 'Šport in rekreacija',
    tourism: 'Turizem',
    culture: 'Kultura in zabava',
    historic: 'Zgodovinski objekti',
    religion: 'Sakralni objekti',
    institution: 'Ustanove',
    finance: 'Finance',
    health: 'Zdravstvo',
    'man-made': 'Grajeni objekti',
    barrier: 'Ovire',
    facility: 'Oprema',
    other: 'Drugo',
  },
};

export default sl;
