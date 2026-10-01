import { type MapBody, NLC_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'maplibre'> = {
  url: 'https://nlc-v2.tiles.freemap.sk/styles/lesne/style.json',
  attribution: [NLC_ATTR],
  zIndex: 3,
  // leaflet minZoom; the source data starts at zoom 8 and maplibre-gl-leaflet
  // runs one zoom level behind (see MaplibreLayer), so it appears at leaflet 9
  minZoom: 9,
};

export default def;
