import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ShadingMessages } from './ShadingMessages.js';

const pl: DeepPartialWithRequiredObjects<ShadingMessages> = {
  add: 'Dodaj',
  apply: 'Zastosuj',
  inBrowser: 'W przeglądarce',
  onServer: 'Na serwerze',
  revert: 'Cofnij zmiany',
  background: 'Tło',
  contour: 'Warstwica',
  fogInversion: 'Mgła / inwersja',
  elevation: 'Wysokość',
  elevationBandWidth: 'Szerokość pasma wysokości',
  color: 'Kolor',
  belowColor: 'Kolor poniżej',
  aboveColor: 'Kolor powyżej',
  exaggeration: 'Przewyższenie',
  exaggerationHint:
    'Wysokości są przez nie mnożone przed cieniowaniem: powyżej 1 rzeźba wydaje się bardziej stroma, poniżej 1 bardziej płaska.',
  azimuth: 'Azymut',
  lightElevation: 'Wysokość',
  parameters: 'Parametry',
  contrast: 'Kontrast',
  brightness: 'Jasność',
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
