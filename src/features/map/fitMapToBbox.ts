import type { Dispatch } from '@reduxjs/toolkit';
import { type Map as LeafletMap, latLngBounds, point } from 'leaflet';
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
  /** The part of the map to fit into, in container pixels; the whole map if unset. */
  area?: { x: number; y: number; width: number; height: number };
  /**
   * Leaves the zoom to the store: a pan whose zoom was never in question must
   * not undo one the store asked for while Leaflet still animates to it.
   */
  keepZoom?: boolean;
}

/**
 * Point the map at a [west, south, east, north] bbox, through the store: the
 * view lives there and the map is refocused from it, so a fit that told the map
 * alone would leave the two disagreeing — the map on the extent, the store and
 * the URL still on the place before it, ready to pull the map back the next
 * time anything refocuses.
 *
 * No-op for a non-finite bbox (empty/invalid geometry yields Infinity/NaN,
 * which makes Leaflet throw "Invalid LatLng"), when the map has been unmounted
 * while awaiting it, or when an `area` leaves no room to fit into.
 */
export async function fitMapToBbox(
  dispatch: Dispatch,
  bbox: [number, number, number, number],
  options?: FitOptions,
): Promise<void> {
  const map = await mapToFit(bbox);

  if (map) {
    fitLoadedMap(map, dispatch, bbox, options);
  }
}

/** The map, where a bbox can be fitted at all: finite, and the map mounted. */
export async function mapToFit(
  bbox: [number, number, number, number],
): Promise<LeafletMap | undefined> {
  if (!bbox.every((n) => Number.isFinite(n))) {
    return undefined;
  }

  const map = await mapPromise;

  return map.getContainer().isConnected ? map : undefined;
}

/** `fitMapToBbox` once the map is at hand and the bbox known to be finite. */
export function fitLoadedMap(
  map: LeafletMap,
  dispatch: Dispatch,
  bbox: [number, number, number, number],
  options?: FitOptions,
): void {
  const size = map.getSize();

  const area = options?.area ?? { x: 0, y: 0, width: size.x, height: size.y };

  const padding = options?.padding ?? 0;

  // A point fitted into nothing comes out at a NaN zoom.
  if (
    options?.area &&
    (area.width <= 2 * padding || area.height <= 2 * padding)
  ) {
    return;
  }

  const bounds = latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);

  // What `fitBounds` works out; `getBoundsZoom` pads the whole map, so what lies
  // outside the area counts as padding.
  const zoom = options?.keepZoom
    ? map.getZoom()
    : Math.max(
        Math.min(
          map.getBoundsZoom(
            bounds,
            false,
            point(
              size.x - area.width + padding * 2,
              size.y - area.height + padding * 2,
            ),
          ),
          options?.maxZoom ?? Number.POSITIVE_INFINITY,
        ),
        options?.minZoom ?? Number.NEGATIVE_INFINITY,
      );

  // The extent's middle in projected pixels (Mercator puts it off the middle of
  // its degrees), placed in the middle of the area.
  const { lat, lng } = map.unproject(
    map
      .project(bounds.getSouthWest(), zoom)
      .add(map.project(bounds.getNorthEast(), zoom))
      .divideBy(2)
      .add(size.divideBy(2))
      .subtract(point(area.x + area.width / 2, area.y + area.height / 2)),
    zoom,
  );

  // Fitting is a jump to something the user asked to see, so it ends GPS
  // following — decided here rather than at each call site so a new caller
  // can't quietly inherit the wrong behavior.
  dispatch(
    mapRefocus(
      options?.keepZoom
        ? { lat, lon: lng, gpsTracked: false }
        : { lat, lon: lng, zoom, gpsTracked: false },
    ),
  );
}
