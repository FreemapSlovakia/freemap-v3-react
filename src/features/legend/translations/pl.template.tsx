import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const pl: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda mapy dla <i>{name}</i>
    </>
  ),

  filter: 'Szukaj w legendzie',

  outdoorMap: {
    'roads-and-paths': 'Drogi i ścieżki',
    railway: 'Kolej',
    transport: 'Transport',
    water: 'Woda',
    terrain: 'Ukształtowanie terenu',
    'natural-poi': 'Obiekty przyrodnicze',
    landcover: 'Pokrycie terenu',
    borders: 'Granice',
    accommodation: 'Noclegi i schrony',
    'gastro-poi': 'Jedzenie i napoje',
    shop: 'Sklepy',
    sport: 'Sport i rekreacja',
    tourism: 'Turystyka',
    culture: 'Kultura i rozrywka',
    historic: 'Obiekty historyczne',
    religion: 'Obiekty sakralne',
    institution: 'Instytucje',
    finance: 'Finanse',
    health: 'Opieka zdrowotna',
    'man-made': 'Budowle',
    barrier: 'Bariery',
    facility: 'Udogodnienia',
    other: 'Inne',
  },
};

export default pl;
