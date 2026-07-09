import type { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const en: OfflineMapExportMessages = {
  format: 'Format',
  map: 'Map',
  unknownMapType: 'Unknown map',
  downloadArea: 'Export',
  name: 'Name',
  zoomRange: 'Zoom range',
  scale: 'Scale',
  email: 'Your email address',
  emailInfo: 'We will use your email to send you the download link.',
  success:
    'The map is being prepared. Once ready, a download link will be sent to your email.',
  summaryTiles: 'Tiles',
  summaryPrice: (amount) => <>Total price: {amount} credits</>,
  usageIntro: 'Where you can use downloaded MBTiles maps:',
  usageDesktop: 'Desktop:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS or OpenLayers (via a tile server such as',
  usageWebMid: 'or',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default en;
