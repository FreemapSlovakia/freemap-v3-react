import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Wandern, Radfahren, Langlauf, Reiten';

const de: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Kartenexport', err),
  cancelExportTitle: 'Export abbrechen',
  cancelExportQuestion: 'Möchten Sie den laufenden Export wirklich abbrechen?',
  area: 'Exportbereich',
  format: 'Format',
  layersTitle: 'Optionale Ebenen',
  mapDataTitle: 'Kartendaten',
  layers: {
    contours: 'Höhenlinien',
    shading: 'Schattiertes Relief',
    hikingTrails: 'Wanderwege',
    bicycleTrails: 'Radwege',
    skiTrails: 'Skipisten',
    horseTrails: 'Reitwege',
  },
  mapScale: 'Kartenauflösung',
  customLayerOrder: 'Platzierung der Kartendaten',
  orders: {
    natural: 'Natürlich',
    topmost: 'Zuoberst',
  },
  decorations: 'Kartendekorationen',
  scaleBar: 'Maßstabsleiste',
  northArrow: 'Nordpfeil',
  attribution: 'Quellenangabe',
  northArrowLetter: 'N',
  glow: 'Schein',
  alert: (licence) => (
    <>
      Hinweise:
      <ul>
        <li>
          Exportiert wird die Karte <i>{outdoorMap}</i>.
        </li>
        <li>Der Kartenexport kann mehrere Sekunden dauern.</li>
        <li>
          Vor der Veröffentlichung der exportierten Karte geben Sie bitte die
          folgende Lizenz an:
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default de;
