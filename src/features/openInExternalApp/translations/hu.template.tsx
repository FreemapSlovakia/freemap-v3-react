import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const hu: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Megosztás / megnyitás külső alkalmazásban',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google térkép',
  hiking_sk: 'hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'mapy.com',
  josm: 'Szerkesztés JOSM-mal',
  id: 'Szerkesztés iD-vel',
  window: 'Új ablakban',
  url: 'Hely megosztása',
  image: 'Fénykép megosztása',
};

export default hu;
