import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const de: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Format',
  map: 'Karte',
  unknownMapType: 'Unbekannte Karte',
  downloadArea: 'Exportieren',
  name: 'Name',
  zoomRange: 'Zoom-Bereich',
  scale: 'Maßstab',
  email: 'Ihre E-Mail-Adresse',
  emailInfo: 'Wir verwenden Ihre E-Mail, um Ihnen den Download-Link zu senden.',
  success:
    'Die Karte wird vorbereitet. Sobald sie fertig ist, erhalten Sie einen Download-Link per E-Mail.',
  summaryTiles: 'Kacheln',
  summaryPrice: (amount) => <>Gesamtpreis: {amount} Credits</>,
  usageIntro: 'Wo Sie heruntergeladene MBTiles-Karten nutzen können:',
  usageDesktop: 'Desktop:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS oder OpenLayers (über einen Tile-Server wie',
  usageWebMid: 'oder',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default de;
