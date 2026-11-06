import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const de: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Teilen / In externer App öffnen',
  openIn: 'Öffnen in…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Maps',
  appleMaps: 'Apple Karten',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Neues Fenster',
  geoApp: 'Karten-App',
  url: 'Standort teilen',
  image: 'Foto teilen',
  linkIncompleteMap:
    'Die Änderungen an der Karte sind nicht gespeichert. Der Link öffnet die Karte so, wie sie zuletzt auf dem Server gespeichert wurde.',
  linkIncompleteData:
    'Die Daten auf der Karte sind zu groß für einen Link. Um sie zu teilen, speichern Sie sie zuerst unter „Meine Karten“.',
};

export default de;
