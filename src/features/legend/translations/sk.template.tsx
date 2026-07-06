import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const sk: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda k mape <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Ubytovanie',
    'gastro-poi': 'Gastronómia',
    institution: 'Inštitúcie',
    sport: 'Šport',
    'natural-poi': 'Prírodné prvky',
    poi: 'Ostatné body záujmu',
    landcover: 'Krajinný pokryv',
    water: 'Voda',
    'roads-and-paths': 'Cesty a chodníky',
    railway: 'Železnice',
    terrain: 'Reliéf',
    borders: 'Hranice',
    other: 'Ostatné',
  },
};

export default sk;
