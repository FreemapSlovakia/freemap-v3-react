import { CUZK_ATTR, type MapBody, OFM_ATTR } from '@shared/mapDefinitions.js';

const def: MapBody<'tile'> = {
  url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  subdomains: ['server', 'services'],
  detail: {
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg?alpha',
    coverageUrl: 'https://ortofoto.tiles.freemap.sk/coverage.bin',
    maxNativeZoom: 20,
    premiumFromZoom: 20,
    attribution: [OFM_ATTR, CUZK_ATTR],
  },
  // only the orthophoto is exported; Esri's tiles aren't ours to hand out
  offlineExport: {
    type: 'Z',
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    creditsPerMTile: 1000,
    countries: ['sk', 'cz'],
  },
  minZoom: 0,
  maxNativeZoom: 19,
  scaleWithDpi: true,
  attribution: [
    {
      type: 'map',
      name: '©\xa0Esri', // TODO others, see https://github.com/esri/esri-leaflet#terms
      url: 'https://www.esri.com/',
    },
  ],
};

export default def;
