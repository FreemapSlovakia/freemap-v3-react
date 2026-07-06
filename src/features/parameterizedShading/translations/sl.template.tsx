import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const sl: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Dodaj',
  background: 'Ozadje',
  contour: 'Plastnica',
  fogInversion: 'Megla / inverzija',
  elevation: 'Nadmorska višina',
  elevationBandWidth: 'Širina višinskega pasu',
  color: 'Barva',
  belowColor: 'Barva pod',
  aboveColor: 'Barva nad',
  exaggeration: 'Poudarjenost',
  azimuth: 'Azimut',
  lightElevation: 'Višina',
  types: {
    'hillshade-igor': 'Senčenje reliefa (Igor)',
    'hillshade-classic': 'Senčenje reliefa (klasično)',
    'slope-igor': 'Naklon (Igor)',
    'slope-classic': 'Naklon (klasično)',
    'color-relief': 'Barvni relief',
    aspect: 'Usmerjenost',
  },
};

export default sl;
