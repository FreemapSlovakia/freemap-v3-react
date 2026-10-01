import {
  type MapBody,
  OUTDOOR_ATTRIBUTION,
  rendererTileUrl,
} from '@shared/mapDefinitions.js';
import transparent1x1 from '@/images/1x1-transparent.png';

/** One of the outdoor renderer's overlays. */
export function rendererOverlay(
  type: Parameters<typeof rendererTileUrl>[0],
  minZoom: number,
  zIndex: number,
): MapBody<'tile'> {
  return {
    url: rendererTileUrl(type),
    extraScales: [2, 3],
    attribution: OUTDOOR_ATTRIBUTION,
    minZoom,
    maxNativeZoom: 20,
    premiumFromZoom: 19,
    zIndex,
    errorTileUrl: transparent1x1,
  };
}
