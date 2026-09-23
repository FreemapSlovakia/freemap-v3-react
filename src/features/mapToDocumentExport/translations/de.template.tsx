import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Wandern, Radfahren, Langlauf, Reiten';

const de: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Kartenexport', err),
  cancelExportTitle: 'Export abbrechen',
  labelTitle: 'Beschriftungen',
  cancelExportQuestion: 'Möchten Sie den laufenden Export wirklich abbrechen?',
  discardExportTitle: 'Export verwerfen',
  discardExportQuestion:
    'Die exportierte Karte wurde noch nicht gespeichert. Möchten Sie sie verwerfen?',
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
  ready: 'Die Karte ist fertig',
  readyCredits:
    'Geben Sie beim Veröffentlichen oder Teilen der Karte diese Quellen an:',
  readyCreditsNone:
    'Der Renderer hat nicht gemeldet, welche Quellen er verwendet hat.',
  readyUnknownSources: 'Quellen, die nicht benannt werden konnten:',
  copyCredits: 'Quellen kopieren',
  openInNewTab: 'In neuem Tab öffnen',
  savedCredits: ({ credits }) =>
    `Karte gespeichert. Geben Sie beim Veröffentlichen oder Teilen an: ${credits}`,
  alert: () => (
    <>
      Exportiert wird die Karte <i>{outdoorMap}</i>. Das kann mehrere zehn
      Sekunden dauern.
    </>
  ),
};

export default de;
