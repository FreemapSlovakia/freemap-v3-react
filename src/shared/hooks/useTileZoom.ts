import { tileDensity, zoomGridOffset } from '@features/map/zoomGrid.js';
import { tileZoomOffset } from '../tileUrl.js';
import { useAppSelector } from './useAppSelector.js';
import { useDevicePixelRatio } from './useDevicePixelRatio.js';

/**
 * The URL zoom a tile layer draws the current view at, as `Layers` and Leaflet
 * pick it: the view's zoom capped by the layer's native zoom, then offset for
 * screen density or feature scale.
 */
export function useTileZoom(): (
  scaleWithDpi: boolean | undefined,
  maxNativeZoom?: number,
) => number {
  const screenDpr = useDevicePixelRatio();

  const pixelExact = useAppSelector((state) => state.map.pixelExact);

  // The level Leaflet rounds to, from its shifted zoom.
  const zoom = useAppSelector((state) =>
    Math.round(state.map.zoom + zoomGridOffset(pixelExact, screenDpr)),
  );

  const resolutionScale = useAppSelector((state) => state.map.resolutionScale);

  const dpr = tileDensity(pixelExact, resolutionScale, screenDpr);

  const featureScale = useAppSelector((state) => state.map.featureScale);

  return (scaleWithDpi, maxNativeZoom = Infinity) => {
    const offset = tileZoomOffset(Boolean(scaleWithDpi), dpr, featureScale);

    // a dense screen's layer is given a native zoom one lower (`toNativeZoom`)
    const cap = offset === 1 ? maxNativeZoom - 1 : maxNativeZoom;

    return Math.max(0, Math.min(zoom, cap) + offset);
  };
}
