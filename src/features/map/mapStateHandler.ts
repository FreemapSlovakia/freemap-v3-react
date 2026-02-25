import { MyStore } from '@app/store/store.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapSetBounds } from './model/actions.js';

export function attachMapStateHandler(store: MyStore) {
  mapPromise.then((map) => {
    let t: number | undefined;

    function handleMapMoveEnd() {
      if (t) {
        window.clearTimeout(t);
      }

      t = window.setTimeout(() => {
        const { zoom, lat, lon } = store.getState().map;

        const { lat: newLat, lng: newLon } = map.getCenter();

        const newZoom = map.getZoom();

        const delta = 5 / Math.pow(2, zoom);

        if (
          zoom !== newZoom ||
          newLat - delta > lat ||
          newLat + delta < lat ||
          newLon - delta > lon ||
          newLon + delta < lon
        ) {
          store.dispatch(
            mapRefocus({ lat: newLat, lon: newLon, zoom: newZoom }),
          );
        }
      }, 250);
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
