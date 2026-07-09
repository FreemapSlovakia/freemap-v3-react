import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const sl: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Format',
  map: 'Zemljevid',
  unknownMapType: 'Neznan zemljevid',
  downloadArea: 'Izvozi',
  name: 'Ime',
  zoomRange: 'Razpon povečave',
  scale: 'Merilo',
  email: 'Vaš e-poštni naslov',
  emailInfo:
    'Vaš e-poštni naslov bomo uporabili za pošiljanje povezave za prenos.',
  success:
    'Zemljevid se pripravlja. Ko bo pripravljen, boste na svoj e-poštni naslov prejeli povezavo za prenos.',
  summaryTiles: 'Ploščic',
  summaryPrice: (amount) => <>Skupna cena: {amount} kreditov</>,
  usageIntro: 'Kje lahko uporabljate prenesene zemljevide MBTiles:',
  usageDesktop: 'Računalnik:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Splet:',
  usageWebLead:
    'Leaflet, MapLibre GL JS ali OpenLayers (prek strežnika ploščic, na primer',
  usageWebMid: 'ali',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default sl;
