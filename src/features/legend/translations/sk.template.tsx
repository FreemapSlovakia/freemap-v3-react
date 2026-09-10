import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const sk: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda k mape <i>{name}</i>
    </>
  ),

  filter: 'Hľadať v legende',

  outdoorMap: {
    'roads-and-paths': 'Cesty a chodníky',
    railway: 'Železnice',
    transport: 'Doprava',
    water: 'Voda',
    terrain: 'Reliéf',
    'natural-poi': 'Prírodné prvky',
    landcover: 'Krajinný pokryv',
    borders: 'Hranice',
    accommodation: 'Ubytovanie a prístrešky',
    'gastro-poi': 'Gastronómia',
    shop: 'Obchody',
    sport: 'Šport a rekreácia',
    tourism: 'Turistické zaujímavosti',
    culture: 'Kultúra a zábava',
    historic: 'Historické objekty',
    religion: 'Sakrálne objekty',
    institution: 'Inštitúcie',
    finance: 'Financie',
    health: 'Zdravotníctvo',
    'man-made': 'Technické stavby',
    barrier: 'Zábrany',
    facility: 'Vybavenosť',
    other: 'Ostatné',
  },
};

export default sk;
