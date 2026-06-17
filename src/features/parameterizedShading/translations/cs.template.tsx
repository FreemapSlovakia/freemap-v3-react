import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ShadingMessages } from './ShadingMessages.js';

const cs: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Přidat',
  background: 'Pozadí',
  contour: 'Vrstevnice',
  fogInversion: 'Mlha / inverze',
  elevation: 'Nadmořská výška',
  elevationBandWidth: 'Šířka výškového pásma',
  color: 'Barva',
  belowColor: 'Barva pod',
  aboveColor: 'Barva nad',
  exaggeration: 'Zvýraznění',
  azimuth: 'Azimut',
  lightElevation: 'Výška',
  types: {
    'hillshade-igor': 'Stínování reliéfu (Igor)',
    'hillshade-classic': 'Stínování reliéfu (klasické)',
    'slope-igor': 'Sklon (Igor)',
    'slope-classic': 'Sklon (klasický)',
    'color-relief': 'Barevný reliéf',
    aspect: 'Orientace',
  },
};

export default cs;
