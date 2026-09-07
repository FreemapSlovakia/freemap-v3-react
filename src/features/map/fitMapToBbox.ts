import type { Dispatch } from '@reduxjs/toolkit';
import { latLngBounds, point } from 'leaflet';
import { mapPromise } from './hooks/leafletElementHolder.js';
import { mapRefocus } from './model/actions.js';

export interface FitOptions {
  /** Free space to leave around the extent, in pixels on every side. */
  padding?: number;
  maxZoom?: number;
  /**
   * Zoom to keep even where the extent will not fit in it — for a layer that
   * draws nothing further out, arriving at its area is no use below this.
   */
  minZoom?: number;
}

/**
 * Point the map at a [west, south, east, north] bbox, through the store: the
 * view lives there and the map is refocused from it, so a fit that told the map
 * alone would leave the two disagreeing — the map on the extent, the store and
 * the URL still on the place before it, ready to pull the map back the next
 * time anything refocuses.
 *
 * No-op for a non-finite bbox (empty/invalid geometry yields Infinity/NaN,
 * which makes Leaflet throw "Invalid LatLng") or when the map has been
 * unmounted while awaiting it: a detached container measures zero, and a
 * viewport of no size fits an extent at no sensible zoom — the answer comes
 * back as the map's maximum, having passed through a NaN.
 */
export async function fitMapToBbox(
  dispatch: Dispatch,
  bbox: [number, number, number, number],
  options?: FitOptions,
): Promise<void> {
  if (!bbox.every((n) => Number.isFinite(n))) {
    return;
  }

  const map = await mapPromise;

  if (!map.getContainer().isConnected) {
    return;
  }

  const bounds = latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);

  // What `fitBounds` works out before handing the view to `setView`: the
  // largest zoom at which the extent still fits the viewport less the padding
  // it must keep free on each side, and the middle of the extent measured in
  // projected pixels at that zoom rather than in degrees, which Mercator would
  // place a little off center.
  const padding = options?.padding ?? 0;

  const zoom = Math.max(
    Math.min(
      map.getBoundsZoom(bounds, false, point(padding * 2, padding * 2)),
      options?.maxZoom ?? Number.POSITIVE_INFINITY,
    ),
    options?.minZoom ?? Number.NEGATIVE_INFINITY,
  );

  const { lat, lng } = map.unproject(
    map
      .project(bounds.getSouthWest(), zoom)
      .add(map.project(bounds.getNorthEast(), zoom))
      .divideBy(2),
    zoom,
  );

  // Fitting is a jump to something the user asked to see, so it ends GPS
  // following — decided here rather than at each call site so a new caller
  // can't quietly inherit the wrong behavior.
  dispatch(mapRefocus({ lat, lon: lng, zoom, gpsTracked: false }));
}
