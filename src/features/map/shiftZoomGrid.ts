import {
  Browser,
  type LatLngBoundsExpression,
  type Map as LeafletMap,
  type Point,
} from 'leaflet';
import { snapZoom } from './zoomGrid.js';

type Internals = { _limitZoom(zoom: number): number };

const offsets = new WeakMap<LeafletMap, number>();

/** How far Leaflet's zoom sits above the store's, which stays on whole levels. */
export function zoomOffsetOf(map: LeafletMap): number {
  return offsets.get(map) ?? 0;
}

/** A Leaflet zoom (the map's own by default) as the store's. */
export function storeZoomOf(map: LeafletMap, zoom = map.getZoom()): number {
  // Rounded so the float error of the shift can't read as a zoom change.
  return Math.round((zoom - zoomOffsetOf(map)) * 1e9) / 1e9;
}

/** A store zoom as Leaflet's. */
export function mapZoomOf(map: LeafletMap, storeZoom: number): number {
  return storeZoom + zoomOffsetOf(map);
}

/**
 * Makes Leaflet's snapping — gestures, `setView`, `fitBounds` — land on the
 * zoom grid shifted `offset` off whole levels (level n at n + offset, the
 * min/max range shifted with it), and moves the view onto it.
 */
export function shiftZoomGrid(map: LeafletMap, offset: number): () => void {
  const m = map as LeafletMap & Internals;

  const level = storeZoomOf(m);

  // Set before the move below, whose `moveend` the store sync converts with it.
  offsets.set(m, offset);

  if (offset) {
    const proto = Object.getPrototypeOf(m) as LeafletMap & Internals;

    const snapOf = () => (Browser.any3d ? (m.options.zoomSnap ?? 1) : 1);

    const clamp = (zoom: number) =>
      Math.max(
        m.getMinZoom() + offset,
        Math.min(m.getMaxZoom() + offset, zoom),
      );

    m._limitZoom = (zoom) => snapZoom(clamp(zoom), snapOf(), offset);

    m.getBoundsZoom = (
      bounds: LatLngBoundsExpression,
      inside?: boolean,
      padding?: Point,
    ) => {
      const snap = snapOf();

      const { zoomSnap, minZoom, maxZoom } = m.options;

      const min = m.getMinZoom();

      const max = m.getMaxZoom();

      // Leaflet's own answer, neither snapped nor clamped to the unshifted range.
      Object.assign(m.options, {
        zoomSnap: 0,
        minZoom: -Infinity,
        maxZoom: Infinity,
      });

      let zoom: number;

      try {
        zoom = proto.getBoundsZoom.call(m, bounds, inside, padding);
      } finally {
        Object.assign(m.options, { zoomSnap, minZoom, maxZoom });
      }

      if (snap) {
        // As Leaflet: within 1 % of a level counts as on it.
        const at = Math.round((zoom - offset) / (snap / 100)) * (snap / 100);

        zoom =
          (inside ? Math.ceil(at / snap) : Math.floor(at / snap)) * snap +
          offset;
      }

      return Math.max(min + offset, Math.min(max + offset, zoom));
    };
  }

  const zoom = m._limitZoom(level + offset);

  if (Math.abs(zoom - m.getZoom()) > 1e-9) {
    m.setZoom(zoom, { animate: false });
  }

  return () => {
    // Back to the prototype's.
    delete (m as Partial<Internals>)._limitZoom;

    delete (m as Partial<LeafletMap>).getBoundsZoom;
  };
}
