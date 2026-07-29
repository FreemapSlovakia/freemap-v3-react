import type { FitBoundsOptions } from 'leaflet';
import { mapPromise } from './hooks/leafletElementHolder.js';
import { duringProgrammaticMove, markMapNavigation } from './moveOrigin.js';

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

  // Fitting is a jump to something the user asked to see, so it ends GPS
  // following — marked here rather than at each call site so a new caller
  // can't quietly inherit the wrong behavior.
  markMapNavigation();

  // `fitBounds` reaches `setView`, whose opening `_stop()` ends a running pan
  // by completing it in place and firing `moveend` at that intermediate center.
  // Left unmarked, the store would be refocused onto it and then dragged back
  // there, off the extent being fitted.
  duringProgrammaticMove(() =>
    map.fitBounds(
      [
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]],
      ],
      options,
    ),
  );
}
