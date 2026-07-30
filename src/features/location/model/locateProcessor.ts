import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  locationSetExternalSource,
  setLocation,
  toggleLocate,
} from './actions.js';

let watch: number | undefined;

// bumped on every toggle so stale async callbacks (the coarse fix in
// particular) can detect that locating was turned off or restarted meanwhile
let session = 0;

/**
 * Starts and stops the browser's own GPS watch so that it runs exactly when the
 * user asked to be located *and* nothing else is supplying fixes.
 *
 * Both conditions can change independently — the locate button, and a recording
 * starting or ending — so this reconciles against the current state rather than
 * reacting to either event on its own. That is also what hands over: the watch
 * starts by itself the moment an external source stops, without the user having
 * to press anything.
 */
export const locateProcessor: Processor<
  typeof toggleLocate | typeof locationSetExternalSource
> = {
  actionCreator: [toggleLocate, locationSetExternalSource],
  handle: async ({ getState, dispatch, action }) => {
    const { locate, externalSource } = getState().location;

    if (toggleLocate.match(action)) {
      if (locate) {
        trackMatomo(['trackEvent', 'Location', 'locate']);
      }

      // Following the position is the locate button's own business, whoever
      // ends up supplying the fixes.
      dispatch(mapRefocus({ gpsTracked: locate }));
    }

    const wanted = locate && !externalSource;

    if (!wanted) {
      if (watch !== undefined) {
        session++;

        window.navigator.geolocation?.clearWatch(watch);

        watch = undefined;
      }

      return;
    }

    if (watch !== undefined) {
      return;
    }

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
            at === null || speed === null || Number.isNaN(speed) ? null : speed,
          at: at ?? Date.now(),
        }),
      );
      // Following the fix is `followLocationProcessor`'s job, so that a fix from
      // anywhere else moves the map too.
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
  },
};
