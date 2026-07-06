import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const it: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda mappa per <i>{name}</i>
    </>
  ),

  outdoorMap: {
    accommodation: 'Alloggio',
    'gastro-poi': 'Cibo e bevande',
    institution: 'Istituzioni',
    sport: 'Sport',
    'natural-poi': 'Elementi naturali',
    poi: 'Altri punti di interesse',
    landcover: 'Copertura del suolo',
    borders: 'Confini',
    'roads-and-paths': 'Strade e sentieri',
    railway: 'Ferrovie',
    terrain: 'Terreno',
    water: 'Acqua',
    other: 'Altro',
  },
};

export default it;
