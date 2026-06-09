import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const cs: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Formát',
  map: 'Mapa',
  unknownMapType: 'Neznámá mapa',
  downloadArea: 'Exportovat',
  area: {
    visible: 'Viditelná oblast',
    byArea: 'Vybraná oblast',
    pickHint: 'Upravte obdélník pro výběr oblasti',
  },
  name: 'Název',
  zoomRange: 'Rozsah přiblížení',
  scale: 'Měřítko',
  email: 'Vaše e-mailová adresa',
  emailInfo: 'Váš e-mail použijeme k zaslání odkazu ke stažení.',
  success:
    'Mapa se připravuje. Po dokončení vám bude e-mailem doručen odkaz ke stažení.',
  summaryTiles: 'Dlaždic',
  summaryPrice: (amount) => <>Celková cena: {amount} kreditů</>,
  usageIntro: 'Kde můžete používat stažené mapy MBTiles:',
  usageDesktop: 'Počítač:',
  usageAndroid: 'Android:',
  usageIos: 'iOS:',
  usageWeb: 'Web:',
  usageWebLead:
    'Leaflet, MapLibre GL JS nebo OpenLayers (prostřednictvím tile serveru, například',
  usageWebMid: 'nebo',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default cs;
