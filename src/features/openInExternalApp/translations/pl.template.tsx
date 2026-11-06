import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const pl: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Udostępnij / Otwórz w zewnętrznej aplikacji.',
  openIn: 'Otwórz w…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Maps',
  appleMaps: 'Mapy Apple',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Nowe okno',
  geoApp: 'Aplikacja mapowa',
  url: 'Udostępnij lokalizację',
  image: 'Udostępnij zdjęcie',
  linkIncompleteMap:
    'Zmiany na mapie nie są zapisane. Link otwiera mapę w wersji ostatnio zapisanej na serwerze.',
  linkIncompleteData:
    'Dane na mapie są za duże, aby zmieścić się w linku. Aby je udostępnić, należy najpierw zapisać je w „Moje mapy”.',
};

export default pl;
