import { selectFeature } from '../../../../actions/mainActions.js';
import { mapRefocus } from '../../../map/model/actions.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';
import { trackingTrackSelector } from '../../../../selectors/mainSelectors.js';

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
