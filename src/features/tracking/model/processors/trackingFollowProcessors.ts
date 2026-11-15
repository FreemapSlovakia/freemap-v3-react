import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { trackingActions } from '../actions.js';

const GONE = Symbol('gone');

const isWatched = (state: RootState, token: string) =>
  state.tracking.trackedDevices.some((d) => d.token === token);

/** The followed device's latest position, or `GONE` while it is not watched. */
function followedPoint(state: RootState) {
  const token = state.map.followedDevice;

  if (token === null) {
    return undefined;
  }

  return isWatched(state, token)
    ? state.tracking.tracks.find((t) => t.token === token)?.trackPoints.at(-1)
    : GONE;
}

/** Centering is left to `trackingFollowProcessor`, which the new token sets off. */
export const trackingFollowStartProcessor: Processor<
  typeof trackingActions.follow
> = {
  actionCreator: trackingActions.follow,
  handle({ dispatch, getState, action }) {
    if (action.payload !== null) {
      dispatch(
        mapRefocus({ gpsTracked: true, followedDevice: action.payload }),
      );
    } else if (getState().map.followedDevice !== null) {
      dispatch(mapRefocus({ gpsTracked: false }));
    }
  },
};

/** Moves the map with the followed device; a drag ends it, as `gpsTracked` does. */
export const trackingFollowProcessor: Processor = {
  stateChangePredicate: followedPoint,
  handle({ dispatch, getState, prevState }) {
    const state = getState();

    const point = followedPoint(state);

    if (point === GONE) {
      // Only a device dropped from the watched ones; a link's `follow=` can
      // come before the saved map that watches it.
      // TODO one never watched stays followed until a drag.
      // TODO an embed, with no Follow control, loses following on a drag.
      const token = state.map.followedDevice;

      if (token !== null && isWatched(prevState, token)) {
        dispatch(mapRefocus({ gpsTracked: false }));
      }
    } else if (point) {
      dispatch(
        mapRefocus({ lat: point.lat, lon: point.lon, gpsTracked: true }),
      );
    }
  },
};
