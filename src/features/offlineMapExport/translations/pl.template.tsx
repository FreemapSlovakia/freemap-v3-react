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
  email: 'Adres e-mail',
  emailInfo: 'Adres e-mail zostanie użyty do przesłania linku do pobrania.',
  noVerifiedEmail:
    'Link do pobrania jest wysyłany na potwierdzony adres e-mail, a konto jeszcze go nie ma.',
  addVerifiedEmail: 'Dodaj go w ustawieniach konta',
  success:
    'Mapa jest przygotowywana. Po zakończeniu link do pobrania zostanie wysłany na podany e-mail.',
  summaryTiles: 'Płytki',
  summarySize: 'Szacowany rozmiar',
  summaryPrice: (amount) => <>Łączna cena: {amount} kredytów</>,
  usageIntro: 'Gdzie można używać pobranych map MBTiles:',
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
  outsideCoverage: (countries) =>
    `Ta mapa jest eksportowana tylko dla krajów: ${countries}. Reszta obszaru pozostanie pusta.`,
};

export default pl;
