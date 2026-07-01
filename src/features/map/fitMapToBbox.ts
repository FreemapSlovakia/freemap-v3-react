import type { FitBoundsOptions } from 'leaflet';
import { mapPromise } from './hooks/leafletElementHolder.js';

/**
 * Fit the map to a [west, south, east, north] bbox. No-op for a non-finite
 * bbox (empty/invalid geometry yields Infinity/NaN, which makes Leaflet throw
 * "Invalid LatLng") or when the map has been unmounted while awaiting it (its
 * container detached, panes removed — touching it would throw on `_mapPane`).
 */
export async function fitMapToBbox(
  bbox: [number, number, number, number],
  options?: FitBoundsOptions,
): Promise<void> {
  if (!bbox.every((n) => Number.isFinite(n))) {
    return;
  }

  const map = await mapPromise;

  if (!map.getContainer().isConnected) {
    return;
  }

  map.fitBounds(
    [
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]],
    ],
    options,
  );
}
