import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const pl: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Umieść środek tablicy przyciskiem ◎ na pasku narzędzi.',
  addCenter: 'Umieść środek',
  moveCenter: 'Przenieś środek',
  pickCenterPrompt: 'Kliknij mapę tam, gdzie stoi tablica',
  addPointsHint:
    'Dodaj rysowane punkty; każdy z nich staje się promieniem tablicy. Środek też jest rysowanym punktem — opisz go i przesuwaj w narzędziu rysowania.',
  downloadAsSvg: 'Pobierz jako SVG',
  osmAttribution: '© współtwórcy OpenStreetMap',
  credit: ({ site }) => `Tablica panoramiczna od ${site}`,
  cardinals: { n: 'N', e: 'E', s: 'S', w: 'W' },
  settings: {
    title: 'Tablica panoramiczna',
    inscriptions: 'Napisy',
    innerCircleRadius: 'Promień wewnętrznego okręgu',
    outerCircleRadius: 'Promień zewnętrznego okręgu',
    scale: 'Skala',
    scaleHint:
      'Wielkość napisów względem tablicy. Zmiana rozmiaru panelu skaluje cały rysunek naraz.',
    preventUpturnedText: 'Nie odwracaj tekstu do góry nogami',
    line1: 'Pierwszy wiersz',
    line2: 'Drugi wiersz',
    lineHint:
      'Dostępne: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} oraz {p:nazwa} dla dowolnej właściwości punktu. Część w [nawiasach kwadratowych] pojawi się tylko wtedy, gdy wszystko w niej ma wartość, na przykład [{elevation} · ]{distance}.',
    placeholders:
      'W napisie można użyć {attribution} dla źródła mapy i {credit} dla tego portalu.',
  },
};

export default pl;
