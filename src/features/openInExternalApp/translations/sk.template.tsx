import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const sk: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Zdieľať / otvoriť v ext. aplikácii',
  openIn: 'Otvoriť v…',
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
  geoApp: 'Mapová aplikácia',
  url: 'Zdieľať polohu',
  image: 'Zdieľať fotografiu',
  linkIncompleteMap:
    'Zmeny v mape nie sú uložené. Odkaz otvorí mapu, ako bola naposledy uložená na serveri.',
  linkIncompleteData:
    'Dáta na mape sú príliš veľké, aby sa zmestili do odkazu. Ak ich chcete zdieľať, uložte ich najprv do „Moje mapy“.',
};

export default sk;
