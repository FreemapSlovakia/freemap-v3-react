import { type MapBody, OFM_URL } from '@shared/mapDefinitions.js';
import white1x1 from '@/images/1x1-white.png';

const def: MapBody<'tile'> = {
  url: 'https://ofmozaika2c.tiles.freemap.sk/{z}/{x}/{y}.jpg',
  minZoom: 0,
  maxNativeZoom: 19,
  scaleWithDpi: true,
  attribution: [
    {
      type: 'map',
      name: '©\xa0GKÚ, NLC',
      url: OFM_URL,
    },
  ],
  errorTileUrl: white1x1,
  creditsPerMTile: 1000,
};

export default def;
