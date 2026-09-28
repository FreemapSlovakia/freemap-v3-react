import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const sl: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Dodaj',
  apply: 'Uporabi',
  inBrowser: 'V brskalniku',
  onServer: 'Na strežniku',
  revert: 'Razveljavi spremembe',
  background: 'Ozadje',
  contour: 'Plastnica',
  fogInversion: 'Megla / inverzija',
  elevation: 'Nadmorska višina',
  elevationBandWidth: 'Širina višinskega pasu',
  color: 'Barva',
  belowColor: 'Barva pod',
  aboveColor: 'Barva nad',
  exaggeration: 'Povečanje višin',
  exaggerationHint:
    'Višine se pred senčenjem pomnožijo s tem številom: nad 1 je relief videti strmejši, pod 1 bolj položen.',
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
