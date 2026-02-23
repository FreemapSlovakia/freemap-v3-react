import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackingTrackSelector } from '@app/store/selectors.js';
import { mapRefocus } from '@features/map/model/actions.js';

export const trackingFollowProcessor: Processor = {
  async handle({ dispatch, getState, action, prevState }) {
    const track = trackingTrackSelector(getState());

    const differs = trackingTrackSelector(prevState) !== track;

    let tp;

    if (
      track &&
      (!selectFeature.match(action) || action.payload?.type !== 'tracking') &&
      differs &&
      (tp = track.trackPoints.at(-1))
    ) {
      const { lat, lon } = tp;

      dispatch(mapRefocus({ lat, lon }));
    }
  },
};
