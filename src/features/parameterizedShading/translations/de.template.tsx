import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const de: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Hinzufügen',
  apply: 'Anwenden',
  inBrowser: 'Im Browser',
  onServer: 'Auf dem Server',
  revert: 'Änderungen verwerfen',
  background: 'Hintergrund',
  contour: 'Höhenlinie',
  fogInversion: 'Nebel / Inversion',
  elevation: 'Höhe',
  elevationBandWidth: 'Breite des Höhenbands',
  color: 'Farbe',
  belowColor: 'Farbe darunter',
  aboveColor: 'Farbe darüber',
  exaggeration: 'Überhöhung',
  exaggerationHint:
    'Die Höhen werden vor der Schattierung damit multipliziert: über 1 wirkt das Relief steiler, unter 1 flacher.',
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
