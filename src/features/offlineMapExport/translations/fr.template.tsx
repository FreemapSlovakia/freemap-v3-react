import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OfflineMapExportMessages } from './OfflineMapExportMessages.js';

const fr: DeepPartialWithRequiredObjects<OfflineMapExportMessages> = {
  format: 'Format',
  map: 'Carte',
  unknownMapType: 'Carte inconnue',
  downloadArea: 'Exporter',
  name: 'Nom',
  zoomRange: 'Plage de zoom',
  scale: 'Échelle',
  email: 'Votre adresse e-mail',
  emailInfo:
    'Nous utiliserons votre e-mail pour vous envoyer le lien de téléchargement.',
  success:
    'La carte est en cours de préparation. Une fois prête, un lien de téléchargement sera envoyé à votre adresse e-mail.',
  summaryTiles: 'Tuiles',
  summaryPrice: (amount) => <>Prix total : {amount} crédits</>,
  usageIntro: 'Où vous pouvez utiliser les cartes MBTiles téléchargées :',
  usageDesktop: 'Ordinateur :',
  usageAndroid: 'Android :',
  usageIos: 'iOS :',
  usageWeb: 'Web :',
  usageWebLead:
    'Leaflet, MapLibre GL JS ou OpenLayers (via un serveur de tuiles tel que',
  usageWebMid: 'ou',
  usageWebTrail: ')',
  formatMbtiles: 'MBTiles',
  formatSqlitedb: 'SQLiteDB',
  formatMbtilesTooltip: 'Locus Map, Guru Maps, OruxMaps',
  formatSqlitedbTooltip: 'OsmAnd, Locus Map',
};

export default fr;
