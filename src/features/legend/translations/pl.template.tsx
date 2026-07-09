import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const pl: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda mapy dla <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Noclegi',
    'gastro-poi': 'Jedzenie i napoje',
    institution: 'Instytucje',
    sport: 'Sport',
    'natural-poi': 'Obiekty przyrodnicze',
    poi: 'Inne punkty zainteresowania',
    landcover: 'Pokrycie terenu',
    borders: 'Granice',
    'roads-and-paths': 'Drogi i ścieżki',
    railway: 'Kolej',
    terrain: 'Ukształtowanie terenu',
    water: 'Woda',
    other: 'Inne',
  },
};

export default pl;
