import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const cs: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Sdílet / otevřít v ext. aplikaci',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Mapy',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'Editor JOSM',
  id: 'Editor iD',
  window: 'Nové okno',
  url: 'Sdílet polohu',
  image: 'Sdílet fotografii',
};

export default cs;
