import { CUZK_ATTR, type MapBody, OFM_ATTR } from '@shared/mapDefinitions.js';

const ORTHOPHOTO_TILES = 'https://ortofoto.tiles.freemap.sk/{z}/{x}/{y}.jpg';

// what the drawn detail and the downloaded stand-in share
const orthophoto = {
  coverageUrl: 'https://ortofoto.tiles.freemap.sk/coverage.bin',
  maxNativeZoom: 20,
  premiumFromZoom: 20,
  attribution: [OFM_ATTR, CUZK_ATTR],
};

const def: MapBody<'tile'> = {
  url: 'https://{s}.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  subdomains: ['server', 'services'],
  detail: { ...orthophoto, url: `${ORTHOPHOTO_TILES}?alpha` },
  // only the orthophoto is exported and downloaded; Esri's tiles aren't ours
  // to hand out
  offlineExport: {
    ...orthophoto,
    type: 'Z',
    url: ORTHOPHOTO_TILES,
    minZoom: 0,
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
