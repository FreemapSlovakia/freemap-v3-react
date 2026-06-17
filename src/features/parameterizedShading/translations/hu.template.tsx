import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ShadingMessages } from './ShadingMessages.js';

const hu: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Hozzáadás',
  background: 'Háttér',
  contour: 'Szintvonal',
  fogInversion: 'Köd / inverzió',
  elevation: 'Magasság',
  elevationBandWidth: 'Magassági sáv szélessége',
  color: 'Szín',
  belowColor: 'Alsó szín',
  aboveColor: 'Felső szín',
  exaggeration: 'Túlzás',
  azimuth: 'Azimut',
  lightElevation: 'Magassági szög',
  types: {
    'hillshade-igor': 'Domborzatárnyékolás (Igor)',
    'hillshade-classic': 'Domborzatárnyékolás (klasszikus)',
    'slope-igor': 'Lejtés (Igor)',
    'slope-classic': 'Lejtés (klasszikus)',
    'color-relief': 'Színes domborzat',
    aspect: 'Kitettség',
  },
};

export default hu;
