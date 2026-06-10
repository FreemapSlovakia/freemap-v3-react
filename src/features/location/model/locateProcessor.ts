import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LatLng } from 'leaflet';
import { setLocation, toggleLocate } from './actions.js';

let watch: number | undefined;

// bumped on every toggle so stale async callbacks (the coarse fix in
// particular) can detect that locating was turned off or restarted meanwhile
let session = 0;

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState, dispatch }) => {
    if (getState().location.locate) {
      window._paq.push(['trackEvent', 'Location', 'locate']);

      dispatch(mapRefocus({ gpsTracked: true }));

      const map = await mapPromise;

      const mySession = ++session;

      const applyFix = ({
        latitude,
        longitude,
        accuracy,
      }: GeolocationCoordinates) => {
        if (mySession !== session) {
          return;
        }

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
      };

      // phase 1: quick coarse fix so the marker appears immediately; ignored if
      // the accurate watch already delivered a fix
      window.navigator.geolocation?.getCurrentPosition(
        ({ coords }) => {
          if (!getState().location.location) {
            applyFix(coords);
          }
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 600_000, timeout: 10_000 },
      );

      // phase 2: accurate continuous tracking
      watch = window.navigator.geolocation?.watchPosition(
        ({ coords }) => {
          applyFix(coords);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            dispatch(toggleLocate(false));

            dispatch(
              toastsAdd({
                id: 'main.locationError',
                messageKey: 'main.locationError',
                style: 'danger',
                timeout: 5_000,
              }),
            );
          }
          // POSITION_UNAVAILABLE / TIMEOUT: transient signal loss — keep the
          // watch running so tracking recovers on its own once GPS returns
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30_000 },
      );
    } else if (window.navigator.geolocation && typeof watch === 'number') {
      session++;

      dispatch(mapRefocus({ gpsTracked: false }));

      window.navigator.geolocation.clearWatch(watch);

      watch = undefined;
    }
  },
};
