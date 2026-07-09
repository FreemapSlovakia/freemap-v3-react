import type { MyStore } from '@app/store/store.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapSetBounds } from './model/actions.js';

export function attachMapStateHandler(store: MyStore) {
  mapPromise.then((map) => {
    // `moveend` already fires once per settled gesture, and the URL processor
    // now coalesces consecutive viewport changes into a single history entry,
    // so no debounce is needed here. The delta threshold below still guards
    // against dispatching when the position didn't meaningfully change.
    function handleMapMoveEnd() {
      const { zoom, lat, lon } = store.getState().map;

      const { lat: newLat, lng: newLon } = map.getCenter();

      const newZoom = map.getZoom();

      const delta = 5 / 2 ** zoom;

      if (
        zoom !== newZoom ||
        newLat - delta > lat ||
        newLat + delta < lat ||
        newLon - delta > lon ||
        newLon + delta < lon
      ) {
        store.dispatch(mapRefocus({ lat: newLat, lon: newLon, zoom: newZoom }));
      }
    }

    map.on('moveend', handleMapMoveEnd);

    let debounceRef: number | undefined;

    function handleViewportChange(delay = 0) {
      if (debounceRef) {
        window.clearTimeout(debounceRef);
      }

      debounceRef = window.setTimeout(() => {
        debounceRef = undefined;

        const bounds = map.getBounds();

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
