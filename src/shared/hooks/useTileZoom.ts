import { tileZoomOffset } from '../tileUrl.js';
import { useAppSelector } from './useAppSelector.js';

/**
 * The URL zoom a tile layer draws the current view at, as `Layers` and Leaflet
 * pick it: the view's zoom capped by the layer's native zoom, then offset for
 * screen density or feature scale.
 */
export function useTileZoom(): (
  scaleWithDpi: boolean | undefined,
  maxNativeZoom?: number,
) => number {
  const zoom = useAppSelector((state) => Math.round(state.map.zoom));

  const dpr = useAppSelector(
    (state) => state.map.resolutionScale ?? (window.devicePixelRatio || 1),
  );

  const featureScale = useAppSelector((state) => state.map.featureScale);

  return (scaleWithDpi, maxNativeZoom = Infinity) => {
    const offset = tileZoomOffset(Boolean(scaleWithDpi), dpr, featureScale);

    // a dense screen's layer is given a native zoom one lower (`toNativeZoom`)
    const cap = offset === 1 ? maxNativeZoom - 1 : maxNativeZoom;

    return Math.max(0, Math.min(zoom, cap) + offset);
  };
}
