import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Turystyka, Rower, Biegówki, Jazda konna';

const pl: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) => addError(getMessages()!, 'Błąd eksportu mapy', err),
  cancelExportTitle: 'Anuluj eksport',
  cancelExportQuestion: 'Czy na pewno chcesz anulować trwający eksport?',
  area: 'Obszar eksportu',
  format: 'Format',
  layersTitle: 'Opcjonalne warstwy',
  mapDataTitle: 'Dane mapy',
  layers: {
    contours: 'Poziomice',
    shading: 'Cieniowanie rzeźby terenu',
    hikingTrails: 'Szlaki piesze',
    bicycleTrails: 'Trasy rowerowe',
    skiTrails: 'Trasy narciarskie',
    horseTrails: 'Szlaki konne',
  },
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
  alert: (licence) => (
    <>
      Uwagi:
      <ul>
        <li>
          Eksportowana będzie mapa <i>{outdoorMap}</i>.
        </li>
        <li>Eksport mapy może potrwać kilkadziesiąt sekund.</li>
        <li>
          Udostępniając wyeksportowaną mapę, należy podać następującą licencję:
          <br />
          <em>{licence}</em>
        </li>
      </ul>
    </>
  ),
};

export default pl;
