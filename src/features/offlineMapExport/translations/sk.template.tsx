import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const sk: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Formát',
  map: 'Mapa',
  unknownMapType: 'Neznáma mapa',
  downloadArea: 'Exportovať',
  area: {
    visible: 'Viditeľnú oblasť',
    byArea: 'Označenú oblasť',
    pickHint: 'Upravte obdĺžnik na výber oblasti',
  },
  name: 'Názov',
  zoomRange: 'Rozsah priblíženia',
  scale: 'Mierka',
  email: 'Vaša e-mailová adresa',
  emailInfo: 'Váš e-mail použijeme na zaslanie odkazu na stiahnutie.',
  success:
    'Mapa sa pripravuje. Po dokončení vám bude emailom doručený odkaz na jej stiahnutie.',
  summaryTiles: 'Dlaždíc',
  summaryPrice: (amount) => <>Celková cena: {amount} kreditov</>,
  usageIntro: 'Kde môžete používať stiahnuté mapy MBTiles:',
  usageDesktop: 'Počítač:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS alebo OpenLayers (cez tile server, napríklad',
  usageWebMid: 'alebo',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default sk;
