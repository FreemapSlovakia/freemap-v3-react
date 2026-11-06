import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const hu: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Megosztás / megnyitás külső alkalmazásban',
  openIn: 'Megnyitás itt…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google térkép',
  appleMaps: 'Apple Térképek',
  hiking_sk: 'hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Új ablakban',
  geoApp: 'Térképalkalmazás',
  url: 'Hely megosztása',
  image: 'Fénykép megosztása',
  linkIncompleteMap:
    'A térkép módosításai nincsenek mentve. A hivatkozás a térképet a szerveren utoljára mentett állapotában nyitja meg.',
  linkIncompleteData:
    'A térképen lévő adatok túl nagyok ahhoz, hogy elférjenek egy hivatkozásban. Ha meg szeretné osztani őket, előbb mentse őket a „Saját térképeim” közé.',
};

export default hu;
