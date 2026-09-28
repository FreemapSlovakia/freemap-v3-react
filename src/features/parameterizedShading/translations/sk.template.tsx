import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const sk: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Pridať',
  apply: 'Použiť',
  inBrowser: 'V prehliadači',
  onServer: 'Na serveri',
  revert: 'Vrátiť zmeny',
  background: 'Pozadie',
  contour: 'Vrstevnica',
  fogInversion: 'Hmla / inverzia',
  elevation: 'Nadmorská výška',
  elevationBandWidth: 'Šírka výškového pásma',
  color: 'Farba',
  belowColor: 'Farba pod',
  aboveColor: 'Farba nad',
  exaggeration: 'Zvýraznenie výšok',
  exaggerationHint:
    'Výšky sa ním pred tieňovaním násobia: nad 1 vyzerá reliéf strmší, pod 1 plochší.',
  azimuth: 'Azimut',
  lightElevation: 'Výška',
  types: {
    'hillshade-igor': 'Tieňovanie reliéfu (Igor)',
    'hillshade-classic': 'Tieňovanie reliéfu (klasické)',
    'slope-igor': 'Sklon (Igor)',
    'slope-classic': 'Sklon (klasický)',
    'color-relief': 'Farebný reliéf',
    aspect: 'Orientácia',
  },
};

export default sk;
