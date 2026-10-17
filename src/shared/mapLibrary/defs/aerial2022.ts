import { CUZK_ATTR, type MapBody } from '@shared/mapDefinitions.js';
import white1x1 from '@/images/1x1-white.png';

const def: MapBody<'tile'> = {
  url: 'https://ortofoto-cz-2022-2023.tiles.freemap.sk/{z}/{x}/{y}.jpg',
  minZoom: 0,
  maxNativeZoom: 20,
  scaleWithDpi: true,
  attribution: [CUZK_ATTR],
  errorTileUrl: white1x1,
};

export default def;
