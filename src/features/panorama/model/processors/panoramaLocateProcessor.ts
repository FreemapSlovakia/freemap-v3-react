import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { setLocation, toggleLocate } from '@features/location/model/actions.js';
import { mapRefocus } from '@features/map/model/actions.js';
import {
  panoramaLocate,
  panoramaPick,
  panoramaSetAwaitingFix,
} from '../actions.js';

/**
 * Stands the viewer where the user is, borrowing the map's own Locate me rather
 * than asking the browser separately: one watch, one permission prompt, and the
 * dot on the map to say where the fix put them.
 *
 * A fix already in hand is taken at once. Otherwise locating is turned on and
 * `panoramaFixProcessor` picks the viewpoint off the first fix to arrive — but
 * only when it is off, because `toggleLocate` clears the last fix on its way in
 * and turning on what is already on would throw away the answer.
 *
 * The wait is declared **after** that, since any `toggleLocate` ends a wait:
 * a refused permission turns locating off without ever reporting a failure, so
 * the flag has to answer to the toggle rather than to the error paths, which do
 * not all take the same one.
 */
export const panoramaLocateProcessor: Processor = {
  actionCreator: panoramaLocate,
  handle: async ({ getState, dispatch }) => {
    const { location, locate } = getState().location;

    if (location) {
      dispatch(panoramaPick({ lat: location.lat, lon: location.lon }));

      return;
    }

    if (!locate) {
      dispatch(toggleLocate(true));

      // Locating and following the position are one button on the map, and
      // only the fix is wanted here. Left on, the next fix would pull the map
      // off whatever the panorama had just marked. Undone only where this
      // turned locating on, so a user already following stays following.
      dispatch(mapRefocus({ gpsTracked: false }));
    }

    // `locateProcessor` runs inside that dispatch and can refuse there and
    // then — no geolocation at all, a permission already denied — turning
    // locating straight back off. Read the state rather than assume the ask
    // took: waiting on a fix that cannot come spins for ever, and the toggle
    // that would have cleared the wait happened before there was one.
    if (!getState().location.locate) {
      return;
    }

    dispatch(panoramaSetAwaitingFix(true));
  },
};

/**
 * How far out a fix may be and still be worth a panorama. A view drawn from a
 * kilometre away is of somewhere else — different valley, different skyline —
 * and this costs a render either way.
 */
const MAX_ACCURACY_M = 100;

/**
 * And how stale. `locateProcessor` opens with a deliberately coarse fix —
 * `enableHighAccuracy: false`, ten minutes of cache allowed — so the marker
 * appears at once; that one arrives well before the watch's, and taken as the
 * viewpoint it would draw where the user was ten minutes ago.
 */
const MAX_AGE_MS = 60_000;

/**
 * The fix the panel was waiting for. Gated on `awaitingFix`, so locating for
 * any other reason — the map's own button, a tracking session — doesn't move
 * a viewpoint the user placed by hand, and a render this expensive is never
 * started by a fix nobody asked for.
 *
 * A fix too rough or too old to stand on is left alone rather than refused:
 * the wait simply continues, and the accurate one that follows takes it. The
 * button stays pressable throughout, which is how a user gives up.
 */
export const panoramaFixProcessor: Processor = {
  actionCreator: setLocation,
  statePredicate: (state) => state.panorama.awaitingFix,
  handle: async ({ getState, dispatch }) => {
    const { location } = getState().location;

    if (
      location &&
      location.accuracy <= MAX_ACCURACY_M &&
      Date.now() - location.at <= MAX_AGE_MS
    ) {
      dispatch(panoramaPick({ lat: location.lat, lon: location.lon }));
    }
  },
};
