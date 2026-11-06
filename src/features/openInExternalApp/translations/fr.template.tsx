import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const fr: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Partager / ouvrir dans une application externe',
  openIn: 'Ouvrir dans…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Maps',
  appleMaps: 'Plans (Apple)',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Nouvelle fenêtre',
  geoApp: 'Application de cartes',
  url: 'Partager la localisation',
  image: 'Partager la photo',
  linkIncompleteMap:
    'Les modifications de la carte ne sont pas enregistrées. Le lien ouvre la carte telle qu’elle a été enregistrée en dernier sur le serveur.',
  linkIncompleteData:
    'Les données de la carte sont trop volumineuses pour tenir dans un lien. Pour les partager, enregistrez-les d’abord dans « Mes cartes ».',
};

export default fr;
