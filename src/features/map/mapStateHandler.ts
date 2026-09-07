import type { MyStore } from '@app/store/store.js';
import { onMap } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapSetBounds } from './model/actions.js';
import { isProgrammaticMove } from './moveOrigin.js';

export function attachMapStateHandler(store: MyStore) {
  // re-binds to every map instance; a max-zoom change recreates the map
  onMap((map) => {
    // Where the map was centered when its current zoom began, so a zoom that
    // shifted the center can be told from one that kept it. Measured against
    // the map's own past rather than the store's center, which while following
    // runs ahead of the map by design.
    let centerBeforeZoom: ReturnType<typeof map.getCenter> | undefined;

    map.on('zoomstart', () => {
      centerBeforeZoom = map.getCenter();
    });

    // `moveend` already fires once per settled gesture, and the URL processor
    // now coalesces consecutive viewport changes into a single history entry,
    // so no debounce is needed here. The delta threshold below still guards
    // against dispatching when the position didn't meaningfully change.
    function handleMapMoveEnd() {
      // Leaflet debounces the `moveend` of a container resize by 200 ms, so the
      // map can already be torn down (container detached, panes removed) once
      // the event lands; reading the center would throw on the missing
      // `_mapPane`.
      if (!map.getContainer().isConnected) {
        return;
      }

      // Fired from inside our own `setView` at a mid-animation center that the
      // very same call is on its way to replace; syncing the store to it would
      // rewind the view.
      if (isProgrammaticMove()) {
        return;
      }

      const { zoom, lat, lon, gpsTracked } = store.getState().map;

      const { lat: newLat, lng: newLon } = map.getCenter();

      const newZoom = map.getZoom();

      const before = centerBeforeZoom;

      centerBeforeZoom = undefined;

      const zoomChanged = zoom !== newZoom;

      const delta = 5 / 2 ** zoom;

      const centerMoved =
        newLat - delta > lat ||
        newLat + delta < lat ||
        newLon - delta > lon ||
        newLon + delta < lon;

      // A zoom the map made on its own — the store didn't ask for it — that
      // also carried the center along anchors on a point the user picked:
      // wheel, pinch, double-click, box zoom. That is a choice of where to
      // look, so it ends GPS following. Zooms that keep the center (`+`/`-`,
      // either the buttons or the keys, and a zoom Leaflet clamped) don't.
      const zoomedToPoint =
        zoomChanged &&
        before !== undefined &&
        (before.lat - delta > newLat ||
          before.lat + delta < newLat ||
          before.lng - delta > newLon ||
          before.lng + delta < newLon);

      if (gpsTracked && !zoomedToPoint) {
        // GPS owns the center while following, so a map center that disagrees
        // with the store is an app-driven move still on its way there: Leaflet
        // drops a `setView` issued mid zoom-animation, then ends that
        // animation at the pre-zoom center. Take the zoom, leave the center.
        if (zoomChanged) {
          store.dispatch(mapRefocus({ zoom: newZoom, gpsTracked: true }));
        }

        return;
      }

      if (zoomChanged || centerMoved) {
        store.dispatch(mapRefocus({ lat: newLat, lon: newLon, zoom: newZoom }));
      }
    }

    map.on('moveend', handleMapMoveEnd);

    function stopFollowing() {
      if (store.getState().map.gpsTracked) {
        store.dispatch(mapRefocus({ gpsTracked: false }));
      }
    }

    // Grabbing the map is the deliberate "I'll steer from here" gesture, and
    // the only one Leaflet reports as user-only. `moveend` can't stand in for
    // it: it fires for app-driven moves too, at centers that merely look as if
    // someone dragged there.
    map.on('dragstart', () => {
      stopFollowing();
    });

    // A second finger switches Leaflet from dragging to its touch-zoom handler,
    // which fires no `dragstart` — and it pans as well as zooms, so a gesture
    // that ends on the zoom it started from leaves nothing else to recognize
    // it by. Either way the user is placing the map by hand.
    map.getContainer().addEventListener(
      'touchstart',
      (event) => {
        if (event.touches.length > 1) {
          stopFollowing();
        }
      },
      { passive: true },
    );

    let debounceRef: number | undefined;

    function handleViewportChange(delay = 0) {
      if (debounceRef) {
        window.clearTimeout(debounceRef);
      }

      debounceRef = window.setTimeout(() => {
        debounceRef = undefined;

        // The map can be torn down while a pending timer is still queued
        // (notably the delayed `resize` one); `getBounds()` then throws on a
        // missing map pane. A viewport update on a dead map is a no-op anyway.
        let bounds: ReturnType<typeof map.getBounds>;

        try {
          bounds = map.getBounds();
        } catch {
          return;
        }

        store.dispatch(
          mapSetBounds([
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ]),
        );
      }, delay);
    }

    map.on('moveend', handleViewportChange.bind(null, 0));

    map.on('zoomend', handleViewportChange.bind(null, 0));

    map.on('resize', handleViewportChange.bind(null, 500));

    handleViewportChange();
  });
}
