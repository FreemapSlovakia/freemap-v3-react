import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

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
  mapTitle: 'Karte',
  layers: {
    contours: 'Höhenlinien',
    shading: 'Schattiertes Relief',
    hikingTrails: 'Wanderwege',
    bicycleTrails: 'Radwege',
    skiTrails: 'Skipisten',
    horseTrails: 'Reitwege',
    sacScale: 'Wanderschwierigkeit',
    mtbScale: 'MTB-Schwierigkeit',
    smoothness: 'Straßenzustand',
    waymarking: 'Wegweiser',
  },
  baseMap: 'Grundkarte',
  noBaseMapHint:
    'Nur die ausgewählten Ebenen werden gezeichnet, der Rest ist transparent.',
  omitTitle: 'Weglassen',
  omit: {
    groundCover: 'Bodenbedeckung',
    buildings: 'Gebäude',
  },
  omitHint:
    'Wo etwas weggelassen ist, transparent — zum Überlagern eines Luftbilds, das es besser zeigt.',
  lossless: 'Verlustfrei',
  lossy: 'Verlustbehaftet',
  quality: 'Qualität',
  sizeTitle: 'Größe und Detail',
  zoom: 'Zoomstufe',
  printScale: 'Maßstab',
  mapScale: 'Kartenauflösung',
  printSize: 'Druckgröße',
  imageSize: 'Bildgröße',
  lock: 'Sperren',
  unlock: 'Entsperren',
  scaleFollowsZoom: 'Nicht gesperrt folgt der Maßstab dem Zoom.',
  symbolSize: ({ percent }) =>
    `Text und Symbole werden mit ${percent} % ihrer normalen Größe gedruckt`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'Der Bereich ist für den Export zu groß. Exportieren Sie einen kleineren Bereich.'
      : `Der Bereich ist für diese Zoomstufe zu groß. Verringern Sie den Zoom auf ${zoom} oder exportieren Sie einen kleineren Bereich.`,
  customLayerOrder: 'Platzierung der Kartendaten',
  orders: {
    natural: 'Natürlich',
    topmost: 'Zuoberst',
  },
  decorations: 'Kartendekorationen',
  scaleBar: 'Maßstabsleiste',
  northArrow: 'Nordpfeil',
  attribution: 'Quellenangabe',
  legend: 'Legende',
  legendWidens:
    'Die Legende steht neben der Karte, daher wird das Dokument breiter als das gewählte Papier.',
  webpTooLarge:
    'WebP erlaubt höchstens 16383 px pro Seite, was dieser Export überschreiten kann. Wählen Sie PNG oder eine niedrigere DPI.',
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
      Exportiert wird die <i>{outdoorMap()}</i>-Karte. Das kann mehrere zehn
      Sekunden dauern.
    </>
  ),
};

export default de;
