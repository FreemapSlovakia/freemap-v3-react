import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDevicePixelRatio } from '@shared/hooks/useDevicePixelRatio.js';
import {
  MAX_RADIUS_PX,
  metresToPx,
  type RadiusUnit,
} from '../model/Shading.js';

/** The elevation tile's zoom and row at the map's centre, as the layer fetches it. */
export function useCentreTile() {
  const zoom = useAppSelector((state) => state.map.zoom);

  const lat = useAppSelector((state) => state.map.lat);

  const dpr = useDevicePixelRatio();

  // A dense screen takes tiles a zoom deeper (`Layers`).
  const z = Math.min(Math.round(zoom) + (dpr > 1.4 ? 1 : 0), 18);

  const rad = (lat * Math.PI) / 180;

  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z,
  );

  return { z, y };
}

/**
 * A radius in pixels at tile `z`/`y`, and what is drawn of it: the two differ
 * where metres fall outside the pixels a tile holds.
 */
export function radiusAt(
  { radius, radiusUnit }: { radius: number; radiusUnit: RadiusUnit },
  z: number,
  y: number,
) {
  const px = radiusUnit === 'm' ? metresToPx(radius, z, y) : radius;

  return { px, drawn: Math.min(Math.max(px, 1), MAX_RADIUS_PX) };
}
