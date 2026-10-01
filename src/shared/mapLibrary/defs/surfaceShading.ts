import { FM_ATTR, LLS_URL, type MapBody } from '@shared/mapDefinitions.js';
import black1x1 from '@/images/1x1-black.png';

const def: MapBody<'tile'> = {
  url: 'https://dmp1-shading.tiles.freemap.sk/{z}/{x}/{y}.jpg',
  minZoom: 0,
  maxNativeZoom: 18,
  attribution: [
    FM_ATTR,
    {
      type: 'data',
      name: 'DMP 1.0: ©\xa0ÚGKK SR',
      url: LLS_URL,
    },
  ],
  errorTileUrl: black1x1,
  scaleWithDpi: true,
  creditsPerMTile: 1000,
};

export default def;
