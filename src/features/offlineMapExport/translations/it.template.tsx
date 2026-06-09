import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const it: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Formato',
  map: 'Mappa',
  unknownMapType: 'Mappa sconosciuta',
  downloadArea: 'Esporta',
  name: 'Nome',
  zoomRange: 'Intervallo di zoom',
  scale: 'Scala',
  email: 'Il tuo indirizzo email',
  emailInfo: 'Utilizzeremo la tua email per inviarti il link per il download.',
  success:
    'La mappa è in preparazione. Al termine, riceverai via email un link per scaricarla.',
  summaryTiles: 'Riquadri',
  summaryPrice: (amount) => <>Prezzo totale: {amount} crediti</>,
  usageIntro: 'Dove puoi usare le mappe MBTiles scaricate:',
  usageDesktop: 'Desktop:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS o OpenLayers (tramite un tile server come',
  usageWebMid: 'oppure',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default it;
