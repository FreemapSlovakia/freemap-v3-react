import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { LatLng } from 'leaflet';
import { setLocation } from './actions.js';

/**
 * Keeps the map on the position while `gpsTracked` holds — whoever supplied the
 * fix. It follows the fix rather than the fix's source, so the GPS recorder
 * feeding `setLocation` moves the map exactly as the browser's own watch does.
 *
 * Grabbing the map ends the following: `mapStateHandler` clears `gpsTracked` on
 * a user drag, and this then leaves the map alone until it is set again.
 */
export const followLocationProcessor: Processor<typeof setLocation> = {
  actionCreator: setLocation,
  statePredicate: (state) => state.map.gpsTracked,
  handle: async ({ getState, dispatch, action }) => {
    const map = await mapPromise;

    const { zoom } = getState().map;

    // Snap to whole pixels at this zoom, so a fix that moved by less than one
    // does not nudge the map on every update.
    const latLng = map.unproject(
      map
        .project(new LatLng(action.payload.lat, action.payload.lon), zoom)
        .round(),
      zoom,
    );

    dispatch(
      mapRefocus({ lat: latLng.lat, lon: latLng.lng, gpsTracked: true }),
    );
  },
};
