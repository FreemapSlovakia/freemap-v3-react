import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const pl: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Format',
  map: 'Mapa',
  unknownMapType: 'Nieznana mapa',
  downloadArea: 'Eksportuj',
  name: 'Nazwa',
  zoomRange: 'Zakres powiększenia',
  scale: 'Skala',
  email: 'Twój adres e-mail',
  emailInfo: 'Twój e-mail zostanie użyty do przesłania linku do pobrania.',
  success:
    'Mapa jest przygotowywana. Po zakończeniu otrzymasz link do pobrania na podany e-mail.',
  summaryTiles: 'Płytki',
  summaryPrice: (amount) => <>Łączna cena: {amount} kredytów</>,
  usageIntro: 'Gdzie możesz używać pobranych map MBTiles:',
  usageDesktop: 'Komputer:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS lub OpenLayers (przez serwer kafelków, np.',
  usageWebMid: 'lub',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default pl;
