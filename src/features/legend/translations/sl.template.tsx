import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const sl: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda zemljevida <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Nastanitve',
    'gastro-poi': 'Hrana in pijača',
    institution: 'Ustanove',
    sport: 'Šport',
    'natural-poi': 'Naravne značilnosti',
    poi: 'Druge točke zanimanja',
    landcover: 'Pokrovnost tal',
    water: 'Voda',
    'roads-and-paths': 'Ceste in poti',
    railway: 'Železnice',
    terrain: 'Relief',
    borders: 'Meje',
    other: 'Drugo',
  },
};

export default sl;
