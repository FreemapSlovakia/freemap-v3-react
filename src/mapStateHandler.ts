import { MyStore } from 'store.js';
import { mapRefocus, mapSetBounds } from './actions/mapActions.js';
import { mapPromise } from './leafletElementHolder.js';

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

    function handleViewportChange() {
      const bounds = map.getBounds();

      store.dispatch(
        mapSetBounds([
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ]),
      );
    }

    map.on('moveend', handleViewportChange);

    map.on('zoomend', handleViewportChange);

    map.on('resize', handleViewportChange);

    handleViewportChange();
  });
}
