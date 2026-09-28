import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const it: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Aggiungi',
  apply: 'Applica',
  inBrowser: 'Nel browser',
  onServer: 'Sul server',
  revert: 'Annulla le modifiche',
  background: 'Sfondo',
  contour: 'Curva di livello',
  fogInversion: 'Nebbia / inversione',
  elevation: 'Altitudine',
  elevationBandWidth: 'Larghezza della fascia altitudinale',
  color: 'Colore',
  belowColor: 'Colore inferiore',
  aboveColor: 'Colore superiore',
  exaggeration: 'Esagerazione',
  exaggerationHint:
    'Le quote vengono moltiplicate per questo valore prima dell’ombreggiatura: sopra 1 il rilievo appare più ripido, sotto 1 più piatto.',
  azimuth: 'Azimut',
  lightElevation: 'Elevazione',
  types: {
    'hillshade-igor': 'Ombreggiatura (Igor)',
    'hillshade-classic': 'Ombreggiatura (classica)',
    'slope-igor': 'Pendenza (Igor)',
    'slope-classic': 'Pendenza (classica)',
    'color-relief': 'Rilievo a colori',
    aspect: 'Esposizione',
  },
};

export default it;
