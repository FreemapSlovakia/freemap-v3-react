import { CUZK_ATTR, type MapBody, OFM_ATTR } from '@shared/mapDefinitions.js';

const ORTHOPHOTO_COVERAGE_URL =
  'https://ortofoto.tiles.freemap.sk/coverage.bin';

const ORTHOPHOTO_ATTRIBUTION = [OFM_ATTR, CUZK_ATTR];

const def: MapBody<'tile'> = {
  url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  subdomains: ['server', 'services'],
  detail: {
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg?alpha',
    coverageUrl: ORTHOPHOTO_COVERAGE_URL,
    maxNativeZoom: 20,
    premiumFromZoom: 20,
    attribution: ORTHOPHOTO_ATTRIBUTION,
  },
  // only the orthophoto is exported and downloaded; Esri's tiles aren't ours
  // to hand out
  offlineExport: {
    type: 'Z',
    url: 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg',
    minZoom: 0,
    maxNativeZoom: 20,
    countries: ['sk', 'cz'],
    premiumFromZoom: 20,
    attribution: ORTHOPHOTO_ATTRIBUTION,
    coverageUrl: ORTHOPHOTO_COVERAGE_URL,
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
