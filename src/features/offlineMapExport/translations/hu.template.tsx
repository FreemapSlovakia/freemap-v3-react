import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const hu: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Formátum',
  map: 'Térkép',
  unknownMapType: 'Ismeretlen térkép',
  downloadArea: 'Exportálni',
  name: 'Név',
  zoomRange: 'Nagyítási tartomány',
  scale: 'Lépték',
  email: 'E-mail címed',
  emailInfo: 'Az e-mail címedet a letöltési hivatkozás elküldésére használjuk.',
  success:
    'A térkép előkészítése folyamatban van. A letöltési hivatkozást e-mailben kapja meg, miután elkészült.',
  summaryTiles: 'Csempe',
  summaryPrice: (amount) => <>Teljes ár: {amount} kredit</>,
  usageIntro: 'Hol használhatja a letöltött MBTiles térképeket:',
  usageDesktop: 'Számítógép:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS vagy OpenLayers (csempe-kiszolgálón keresztül, például',
  usageWebMid: 'vagy',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default hu;
