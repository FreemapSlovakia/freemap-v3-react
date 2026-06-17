import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ShadingMessages } from './ShadingMessages.js';

const de: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Hinzufügen',
  background: 'Hintergrund',
  contour: 'Höhenlinie',
  fogInversion: 'Nebel / Inversion',
  elevation: 'Höhe',
  elevationBandWidth: 'Breite des Höhenbands',
  color: 'Farbe',
  belowColor: 'Farbe darunter',
  aboveColor: 'Farbe darüber',
  exaggeration: 'Überhöhung',
  azimuth: 'Azimut',
  lightElevation: 'Höhenwinkel',
  types: {
    'hillshade-igor': 'Schummerung (Igor)',
    'hillshade-classic': 'Schummerung (klassisch)',
    'slope-igor': 'Hangneigung (Igor)',
    'slope-classic': 'Hangneigung (klassisch)',
    'color-relief': 'Farbrelief',
    aspect: 'Exposition',
  },
};

export default de;
