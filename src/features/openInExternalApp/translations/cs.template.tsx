import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const cs: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Sdílet / otevřít v ext. aplikaci',
  openIn: 'Otevřít v…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Mapy',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Nové okno',
  url: 'Sdílet polohu',
  image: 'Sdílet fotografii',
};

export default cs;
