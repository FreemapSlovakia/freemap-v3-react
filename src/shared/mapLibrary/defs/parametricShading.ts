import {
  FM_ATTR,
  type MapBody,
  TERRAIN_TILES_URL,
} from '@shared/mapDefinitions.js';

const def: MapBody<'parametricShading'> = {
  url: `${TERRAIN_TILES_URL}/elevation/{z}/{x}/{y}`,
  scaleWithDpi: true,
  maxNativeZoom: 18,
  // The terrain is credited from terrain-tiles' own dictionary, by what the
  // tiles on screen report (`tileAttribution.ts`).
  attribution: [FM_ATTR],
  premiumFromZoom: 16,
  creditsPerMTile: 1000,
  zIndex: 2,
};

export default def;
