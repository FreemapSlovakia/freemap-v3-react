import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { ShadingMessages } from './ShadingMessages.js';

const pl: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Dodaj',
  background: 'Tło',
  contour: 'Warstwica',
  fogInversion: 'Mgła / inwersja',
  elevation: 'Wysokość',
  elevationBandWidth: 'Szerokość pasma wysokości',
  color: 'Kolor',
  belowColor: 'Kolor poniżej',
  aboveColor: 'Kolor powyżej',
  exaggeration: 'Przewyższenie',
  azimuth: 'Azymut',
  lightElevation: 'Wysokość',
  types: {
    'hillshade-igor': 'Cieniowanie (Igor)',
    'hillshade-classic': 'Cieniowanie (klasyczne)',
    'slope-igor': 'Nachylenie (Igor)',
    'slope-classic': 'Nachylenie (klasyczne)',
    'color-relief': 'Relief barwny',
    aspect: 'Ekspozycja',
  },
};

export default pl;
