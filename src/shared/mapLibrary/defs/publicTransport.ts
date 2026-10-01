import { type MapBody, OSM_DATA_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'tile'> = {
  url: '//tile.memomaps.de/tilegen/{z}/{x}/{y}.png',
  minZoom: 0,
  maxNativeZoom: 18,
  cors: false,
  attribution: [
    {
      type: 'map',
      name: '©\xa0MeMoMaps',
      url: 'https://memomaps.de/en/',
    },
    OSM_DATA_ATTR,
  ],
};

export default def;
