import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { OpenInExternalAppMessages } from './OpenInExternalAppMessages.js';

const it: DeepPartialWithRequiredObjects<OpenInExternalAppMessages> = {
  openInExternal: 'Condividi / Apri su altra App.',
  openIn: 'Apri in…',
  osm: 'OpenStreetMap',
  oma: 'OMA',
  googleMaps: 'Google Maps',
  appleMaps: 'Apple Mappe',
  hiking_sk: 'Hiking.sk',
  zbgis: 'ZBGIS',
  mapy_cz: 'Mapy.com',
  josm: 'JOSM',
  id: 'iD',
  window: 'Nuova finestra',
  geoApp: 'App di mappe',
  url: 'Condividi posizione',
  image: 'Condividi foto',
  linkIncompleteMap:
    'Le modifiche alla mappa non sono salvate. Il link apre la mappa come è stata salvata l’ultima volta sul server.',
  linkIncompleteData:
    'I dati sulla mappa sono troppo grandi per stare in un link. Per condividerli, li salvi prima in «Le mie mappe».',
};

export default it;
