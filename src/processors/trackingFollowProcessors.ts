import { selectFeature } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { trackingTrackSelector } from 'fm3/selectors/mainSelectors';
import { Track } from 'fm3/types/trackingTypes';
import { isActionOf } from 'typesafe-actions';

let prevTrack: Track | undefined;

export const trackingFollowProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ dispatch, getState, action }) => {
    const track = trackingTrackSelector(getState());

    const differs = prevTrack !== track;

    prevTrack = track;

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
