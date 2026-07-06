import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const it: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Aggiungi',
  background: 'Sfondo',
  contour: 'Curva di livello',
  fogInversion: 'Nebbia / inversione',
  elevation: 'Altitudine',
  elevationBandWidth: 'Larghezza della fascia altitudinale',
  color: 'Colore',
  belowColor: 'Colore inferiore',
  aboveColor: 'Colore superiore',
  exaggeration: 'Esagerazione',
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
