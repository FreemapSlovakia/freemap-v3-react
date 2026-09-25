import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turystyka, Rower, Biegówki, Jazda konna';

const pl: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) => addError(getMessages()!, 'Błąd eksportu mapy', err),
  cancelExportTitle: 'Anuluj eksport',
  labelTitle: 'Etykiety',
  cancelExportQuestion: 'Czy na pewno chcesz anulować trwający eksport?',
  discardExportTitle: 'Odrzuć eksport',
  discardExportQuestion:
    'Wyeksportowana mapa nie została jeszcze zapisana. Czy chcesz ją odrzucić?',
  area: 'Obszar eksportu',
  format: 'Format',
  layersTitle: 'Opcjonalne warstwy',
  mapDataTitle: 'Dane mapy',
  mapTitle: 'Mapa',
  layers: {
    contours: 'Poziomice',
    shading: 'Cieniowanie rzeźby terenu',
    hikingTrails: 'Szlaki piesze',
    bicycleTrails: 'Trasy rowerowe',
    skiTrails: 'Trasy narciarskie',
    horseTrails: 'Szlaki konne',
    sacScale: 'Trudność szlaków',
    mtbScale: 'Trudność tras MTB',
    smoothness: 'Stan nawierzchni dróg',
    waymarking: 'Drogowskazy',
  },
  baseMap: 'Mapa podkładowa',
  noBaseMapHint:
    'Rysowane są tylko wybrane warstwy, reszta jest przezroczysta.',
  omitTitle: 'Pomiń',
  omit: {
    groundCover: 'Pokrycie terenu',
    buildings: 'Budynki',
  },
  omitHint:
    'Przezroczysta tam, gdzie coś pominięto — do nałożenia na zdjęcie lotnicze, które pokazuje to lepiej.',
  lossless: 'Bezstratna',
  lossy: 'Stratna',
  quality: 'Jakość',
  mapScale: 'Rozdzielczość mapy',
  customLayerOrder: 'Umiejscowienie danych mapy',
  orders: {
    natural: 'Naturalna',
    topmost: 'Na wierzchu',
  },
  decorations: 'Dekoracje mapy',
  scaleBar: 'Podziałka',
  northArrow: 'Strzałka północy',
  attribution: 'Atrybucja',
  northArrowLetter: 'N',
  glow: 'Poświata',
  ready: 'Mapa jest gotowa',
  readyCredits: 'Publikując lub udostępniając mapę, podaj następujące źródła:',
  readyCreditsNone: 'Renderer nie zgłosił, których źródeł użył.',
  readyUnknownSources: 'Źródła, których nie udało się nazwać:',
  copyCredits: 'Kopiuj źródła',
  openInNewTab: 'Otwórz w nowej karcie',
  savedCredits: ({ credits }) =>
    `Mapa zapisana. Publikując ją lub udostępniając, podaj: ${credits}`,
  alert: () => (
    <>
      Eksportowana będzie mapa <i>{outdoorMap}</i>. Może to potrwać
      kilkadziesiąt sekund.
    </>
  ),
};

export default pl;
