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

  // `fitBounds` reaches `setView`, which opens by ending a running pan in place
  // — firing `moveend` at an intermediate center the store must not be
  // refocused onto, or the map would be dragged back there, off the extent
  // being fitted. Ending that animation here is what the programmatic marker
  // covers, so the fit itself stays outside it: a fit far enough that Leaflet
  // skips the animation settles synchronously, and the `moveend` it fires from
  // inside this call is the only word the store gets on where the map went.
  duringProgrammaticMove(() => map.stop());

  map.fitBounds(
    [
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]],
    ],
    options,
  );
}
