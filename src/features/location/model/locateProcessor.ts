import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LatLng } from 'leaflet';
import { setLocation, toggleLocate } from './actions.js';

let watch: number | undefined;

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState, dispatch }) => {
    if (getState().location.locate) {
      dispatch(mapRefocus({ gpsTracked: true }));

      const map = await mapPromise;

      watch = window.navigator.geolocation?.watchPosition(
        ({ coords: { latitude, longitude, accuracy } }) => {
          dispatch(
            setLocation({
              lat: latitude,
              lon: longitude,
              accuracy,
            }),
          );

          const { zoom, gpsTracked } = getState().map;

          // adjust coordinates to prevent additional map micromovement
          const latLng = map.unproject(
            map.project(new LatLng(latitude, longitude), zoom).round(),
            zoom,
          );

          if (gpsTracked) {
            dispatch(
              mapRefocus({
                lat: latLng.lat,
                lon: latLng.lng,
                gpsTracked: true,
              }),
            );
          }
        },
        () => {
          dispatch(toggleLocate(false));

          dispatch(
            toastsAdd({
              id: 'main.locationError',
              messageKey: 'main.locationError',
              style: 'danger',
              timeout: 5000,
            }),
          );
        },
        { enableHighAccuracy: true, maximumAge: 0 },
      );
    } else if (window.navigator.geolocation && typeof watch === 'number') {
      dispatch(mapRefocus({ gpsTracked: false }));

      window.navigator.geolocation.clearWatch(watch);

      watch = undefined;
    }
  },
};
