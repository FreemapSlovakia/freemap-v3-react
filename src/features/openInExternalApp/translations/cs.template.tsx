import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const cs: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Sdílet / otevřít v ext. aplikaci',
  openIn: 'Otevřít v…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Mapy',
  appleMaps: 'Apple Mapy',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Nové okno',
  geoApp: 'Mapová aplikace',
  url: 'Sdílet polohu',
  image: 'Sdílet fotografii',
  linkIncompleteMap:
    'Změny v mapě nejsou uložené. Odkaz otevře mapu, jak byla naposledy uložena na serveru.',
  linkIncompleteData:
    'Data na mapě jsou příliš velká, aby se vešla do odkazu. Chcete-li je sdílet, uložte je nejprve do „Moje mapy“.',
};

export default cs;
