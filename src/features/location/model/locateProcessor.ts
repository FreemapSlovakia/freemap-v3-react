import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
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
      trackMatomo(['trackEvent', 'Location', 'locate']);

      dispatch(mapRefocus({ gpsTracked: true }));

      const map = await mapPromise;

      const mySession = ++session;

      const applyFix = ({
        coords: { latitude, longitude, accuracy, heading, speed },
        timestamp,
      }: GeolocationPosition) => {
        if (mySession !== session) {
          return;
        }

        // The phase-1 fix may be up to `maximumAge` old, so the age the platform
        // reports is kept rather than stamped as fresh. `null` means it cannot
        // be trusted — a host reporting a monotonic clock instead of the epoch
        // the spec asks for — in which case the course is dropped instead of
        // being passed off as current, since its age is what makes it usable.
        const at =
          Number.isFinite(timestamp) &&
          Math.abs(Date.now() - timestamp) < 86_400_000
            ? timestamp
            : null;

        dispatch(
          setLocation({
            lat: latitude,
            lon: longitude,
            accuracy,
            // NaN slips through some implementations where the spec asks for null
            heading:
              at === null || heading === null || Number.isNaN(heading)
                ? null
                : heading,
            speed:
              at === null || speed === null || Number.isNaN(speed)
                ? null
                : speed,
            at: at ?? Date.now(),
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
        (position) => {
          if (!getState().location.location) {
            applyFix(position);
          }
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 600_000, timeout: 10_000 },
      );

      // phase 2: accurate continuous tracking
      watch = window.navigator.geolocation?.watchPosition(
        applyFix,
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            dispatch(toggleLocate(false));

            dispatch(
              toastsAdd({
                id: 'main.locationError',
                messageKey: 'main.locationError',
                // A denied permission is a user-controlled, self-explanatory
                // condition, not an app error — warn briefly, don't stick.
                style: 'warning',
                timeout: 5000,
              }),
            );
          }
          // POSITION_UNAVAILABLE / TIMEOUT: transient signal loss — keep the
          // watch running so tracking recovers on its own once GPS returns
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30_000 },
      );
    } else if (window.navigator.geolocation && watch !== undefined) {
      session++;

      dispatch(mapRefocus({ gpsTracked: false }));

      window.navigator.geolocation.clearWatch(watch);

      watch = undefined;
    }
  },
};
