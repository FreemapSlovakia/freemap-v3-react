import { type MapBody, NLC_ATTR } from '@shared/mapDefinitions.js';
import transparent1x1 from '@/images/1x1-transparent.png';

const def: MapBody<'tile'> = {
  url: 'https://nlc.tiles.freemap.sk/{z}/{x}/{y}.png',
  attribution: [NLC_ATTR],
  minZoom: 11,
  maxNativeZoom: 15,
  zIndex: 3,
  errorTileUrl: transparent1x1,
  creditsPerMTile: 1000,
};

export default def;
