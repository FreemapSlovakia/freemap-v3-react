import { selectFeature } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { trackingTrackSelector } from 'fm3/selectors/mainSelectors';
import { isActionOf } from 'typesafe-actions';

export const trackingFollowProcessor: Processor = {
  async handle({ dispatch, getState, action, prevState }) {
    const track = trackingTrackSelector(getState());

    const differs = trackingTrackSelector(prevState) !== track;

    let tp;

    if (
      track &&
      (!isActionOf(selectFeature, action) ||
        action.payload?.type !== 'tracking') &&
      differs &&
      (tp = track.trackPoints[track.trackPoints.length - 1])
    ) {
      const { lat, lon } = tp;

      dispatch(mapRefocus({ lat, lon }));
    }
  },
};
