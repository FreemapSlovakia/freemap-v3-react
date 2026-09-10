import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { LegendMessages } from './LegendMessages.js';

const it: DeepPartialWithRequiredObjects<LegendMessages> = {
  body: ({ name }) => (
    <>
      Legenda mappa per <i>{name}</i>
    </>
  ),

  filter: 'Cerca nella legenda',

  outdoorMap: {
    'roads-and-paths': 'Strade e sentieri',
    railway: 'Ferrovie',
    transport: 'Trasporti',
    water: 'Acqua',
    terrain: 'Terreno',
    'natural-poi': 'Elementi naturali',
    landcover: 'Copertura del suolo',
    borders: 'Confini',
    accommodation: 'Alloggio e ripari',
    'gastro-poi': 'Cibo e bevande',
    shop: 'Negozi',
    sport: 'Sport e tempo libero',
    tourism: 'Turismo',
    culture: 'Cultura e intrattenimento',
    historic: 'Oggetti storici',
    religion: 'Luoghi di culto',
    institution: 'Istituzioni',
    finance: 'Finanza',
    health: 'Sanità',
    'man-made': 'Costruzioni',
    barrier: 'Barriere',
    facility: 'Servizi',
    other: 'Altro',
  },
};

export default it;
