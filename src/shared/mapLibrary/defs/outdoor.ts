import {
  type MapBody,
  OUTDOOR_ATTRIBUTION,
  rendererTileUrl,
} from '@shared/mapDefinitions.js';

const def: MapBody<'tile'> = {
  url: rendererTileUrl('X'),
  extraScales: [2, 3, 4],
  attribution: OUTDOOR_ATTRIBUTION,
  minZoom: 5,
  maxNativeZoom: 20,
  premiumFromZoom: 19,
  creditsPerMTile: 5000,
};

export default def;
