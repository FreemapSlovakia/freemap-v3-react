import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const cs: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Přidat',
  apply: 'Použít',
  inBrowser: 'V prohlížeči',
  onServer: 'Na serveru',
  revert: 'Vrátit změny',
  background: 'Pozadí',
  contour: 'Vrstevnice',
  fogInversion: 'Mlha / inverze',
  elevation: 'Nadmořská výška',
  elevationBandWidth: 'Šířka výškového pásma',
  color: 'Barva',
  belowColor: 'Barva pod',
  aboveColor: 'Barva nad',
  exaggeration: 'Zvýraznění výšek',
  exaggerationHint:
    'Výšky se jím před stínováním násobí: nad 1 vypadá reliéf strměji, pod 1 plošeji.',
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
