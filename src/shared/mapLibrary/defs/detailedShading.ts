import { FM_ATTR, LLS_URL, type MapBody } from '@shared/mapDefinitions.js';
import white1x1 from '@/images/1x1-white.png';

const def: MapBody<'tile'> = {
  url: 'https://sk-hires-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
  minZoom: 0,
  maxNativeZoom: 20,
  attribution: [
    FM_ATTR,
    {
      type: 'data',
      name: 'LLS DMR: ©\xa0ÚGKK SR',
      url: LLS_URL,
    },
  ],
  errorTileUrl: white1x1,
  scaleWithDpi: true,
  premiumFromZoom: 15,
  creditsPerMTile: 1000,
};

export default def;
