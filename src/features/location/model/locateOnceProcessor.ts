import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapRefocus } from '@features/map/model/actions.js';
import {
  fixReady,
  requestFix,
  setFixRequest,
  setLocation,
  toggleLocate,
} from './actions.js';

/** How far out a fix may be and still be worth placing something by. */
const MAX_ACCURACY_M = 100;

/**
 * And how stale. `locateProcessor` opens with a deliberately coarse fix (ten
 * minutes of cache allowed) so the marker appears at once; taken as the answer
 * it would place where the user was ten minutes ago.
 */
const MAX_AGE_MS = 60_000;

/**
 * Whether a fix is worth placing something by. The accuracy is what carries it:
 * `locateProcessor` stamps `at` with the current time where the platform's own
 * timestamp is not to be trusted, so a cached fix can arrive looking fresh.
 */
function standable(location: { accuracy: number; at: number }): boolean {
  return (
    location.accuracy <= MAX_ACCURACY_M &&
    Date.now() - location.at <= MAX_AGE_MS
  );
}

/**
 * Answers {@link requestFix} by borrowing the map's own Locate me: one watch,
 * one permission prompt, and the dot to say where the fix put them. A good
 * enough fix in hand is taken at once; otherwise locating is turned on — only
 * when off, since `toggleLocate` clears the last fix on its way in — and
 * `fixReadyProcessor` answers off the first fix worth having.
 */
export const locateOnceProcessor: Processor<typeof requestFix> = {
  actionCreator: requestFix,
  handle: async ({ getState, dispatch, action }) => {
    const consumer = action.payload;

    const { location, locate } = getState().location;

    // The same bar the wait holds later fixes to. A fix already in hand is as
    // likely to be the coarse one — locating may have been on for the map's own
    // reasons for the last ten minutes.
    if (location && standable(location)) {
      dispatch(fixReady({ consumer, lat: location.lat, lon: location.lon }));

      return;
    }

    if (!locate) {
      dispatch(toggleLocate(true));

      // Locating and following the position are one button on the map, and only
      // the fix is wanted here. Left on, the next fix would pull the map off
      // whatever was just placed. Undone only where this turned locating on, so
      // a user already following stays following.
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

    dispatch(setFixRequest(consumer));
  },
};

/**
 * The fix somebody was waiting for. Gated on `fixRequest`, so locating for any
 * other reason doesn't move something the user placed by hand. Too rough or too
 * old is ignored rather than refused: the wait continues, and the button that
 * asked stays pressable, which is how a user gives up.
 */
export const fixReadyProcessor: Processor = {
  actionCreator: setLocation,
  statePredicate: (state) => state.location.fixRequest !== null,
  handle: async ({ getState, dispatch }) => {
    const { location, fixRequest } = getState().location;

    if (fixRequest && location && standable(location)) {
      dispatch(
        fixReady({
          consumer: fixRequest,
          lat: location.lat,
          lon: location.lon,
        }),
      );
    }
  },
};
