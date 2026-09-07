import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackingTrackSelector } from '@app/store/selectors.js';
import { mapRefocus } from '@features/map/model/actions.js';

export const trackingFollowProcessor: Processor = {
  stateChangePredicate: trackingTrackSelector,
  actionPredicate: (action) =>
    !selectFeature.match(action) || action.payload?.type !== 'tracking',
  handle({ dispatch, getState }) {
    const lastPoint = trackingTrackSelector(getState())?.trackPoints.at(-1);

    if (lastPoint) {
      const { lat, lon } = lastPoint;

      dispatch(mapRefocus({ lat, lon }));
    }
  },
};
