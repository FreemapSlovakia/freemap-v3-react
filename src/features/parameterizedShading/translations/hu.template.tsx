import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const hu: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Hozzáadás',
  apply: 'Alkalmaz',
  inBrowser: 'A böngészőben',
  onServer: 'A szerveren',
  revert: 'Változások elvetése',
  background: 'Háttér',
  contour: 'Szintvonal',
  fogInversion: 'Köd / inverzió',
  elevation: 'Magasság',
  elevationBandWidth: 'Magassági sáv szélessége',
  color: 'Szín',
  belowColor: 'Alsó szín',
  aboveColor: 'Felső szín',
  exaggeration: 'Túlzás',
  exaggerationHint:
    'Árnyékolás előtt ezzel szorozzuk a magasságokat: 1 fölött meredekebbnek, 1 alatt laposabbnak látszik a domborzat.',
  azimuth: 'Azimut',
  lightElevation: 'Magassági szög',
  parameters: 'Paraméterek',
  contrast: 'Kontraszt',
  brightness: 'Fényerő',
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
