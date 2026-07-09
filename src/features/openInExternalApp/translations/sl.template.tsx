import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const sl: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Deli / odpri v zunanji aplikaciji',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Maps',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'Urejanje v JOSM',
  id: 'Urejanje v iD',
  window: 'Novo okno',
  url: 'Deli lokacijo',
  image: 'Deli fotografijo',
};

export default sl;
