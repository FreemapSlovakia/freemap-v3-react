import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

// The map's name as the layer menu shows it.
const outdoorMap = () => getMessages()?.mapLayers.letters['X'];

const en: MapToDocumentExportMessages = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Error exporting map', err),
  cancelExportTitle: 'Cancel export',
  cancelExportQuestion: 'Do you really want to cancel the running export?',
  discardExportTitle: 'Discard the export',
  discardExportQuestion:
    'The exported map has not been saved yet. Do you want to discard it?',
  area: 'Export area',
  format: 'Format',
  layersTitle: 'Optional layers',
  mapDataTitle: 'Map data',
  mapTitle: 'Map',
  layers: {
    contours: 'Contours',
    shading: 'Shaded relief',
    hikingTrails: 'Hiking trails',
    bicycleTrails: 'Bicycle trails',
    skiTrails: 'Ski trails',
    horseTrails: 'Horse trails',
    sacScale: 'Hiking difficulty',
    mtbScale: 'MTB difficulty',
    smoothness: 'Road smoothness',
    waymarking: 'Guideposts',
  },
  baseMap: 'Base map',
  noBaseMapHint: 'Only the selected layers are drawn, the rest is transparent.',
  omitTitle: 'Leave out',
  omit: {
    groundCover: 'Ground cover',
    buildings: 'Buildings',
  },
  omitHint:
    'Transparent where left out — for laying over an aerial image, which shows these better.',
  lossless: 'Lossless',
  lossy: 'Lossy',
  quality: 'Quality',
  sizeTitle: 'Size and detail',
  zoom: 'Zoom level',
  printScale: 'Scale',
  mapScale: 'Map resolution',
  printSize: 'Print size',
  imageSize: 'Image size',
  lock: 'Lock',
  unlock: 'Unlock',
  scaleFollowsZoom: 'Unlocked, the scale follows the zoom.',
  symbolSize: ({ percent }) =>
    `Text and symbols print at ${percent} % of their normal size`,
  tooLarge: ({ zoom }) =>
    zoom === null
      ? 'The area is too large to export. Export a smaller area.'
      : `The area is too large for this zoom level. Lower the zoom to ${zoom} or export a smaller area.`,
  customLayerOrder: 'Map data placement',
  orders: {
    natural: 'Natural',
    topmost: 'Topmost',
  },
  decorations: 'Map decorations',
  scaleBar: 'Scale bar',
  northArrow: 'North arrow',
  attribution: 'Attribution',
  legend: 'Legend',
  legendWidens:
    'The legend goes beside the map, so the document comes out wider than the chosen paper.',
  webpTooLarge:
    'WebP allows at most 16383 px per side, which this export may exceed. Choose PNG or a lower DPI.',
  northArrowLetter: 'N',
  glow: 'Glow',
  labelTitle: 'Labels',
  ready: 'The map is ready',
  readyCredits:
    'When you publish or share this map, accompany it with the following attribution:',
  readyCreditsNone: 'The renderer did not report which sources it used.',
  readyUnknownSources: 'Sources that could not be named:',
  copyCredits: 'Copy attribution',
  openInNewTab: 'Open in a new tab',
  savedCredits: ({ credits }) =>
    `Map saved. When you publish or share it, accompany it with: ${credits}`,
  alert: () => (
    <>
      The <i>{outdoorMap()}</i> map will be exported. This may take tens of
      seconds.
    </>
  ),
};

export default en;
