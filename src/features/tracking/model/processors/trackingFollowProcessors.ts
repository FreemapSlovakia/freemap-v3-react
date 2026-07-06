import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackingTrackSelector } from '@app/store/selectors.js';
import { mapRefocus } from '@features/map/model/actions.js';

export const trackingFollowProcessor: Processor = {
  async handle({ dispatch, getState, action, prevState }) {
    const track = trackingTrackSelector(getState());

    const differs = trackingTrackSelector(prevState) !== track;

    const lastPoint =
      track &&
      (!selectFeature.match(action) || action.payload?.type !== 'tracking') &&
      differs
        ? track.trackPoints.at(-1)
        : undefined;

    if (lastPoint) {
      const { lat, lon } = lastPoint;

      dispatch(mapRefocus({ lat, lon }));
    }
  },
};
