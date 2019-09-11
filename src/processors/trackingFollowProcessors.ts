import { mapRefocus } from 'fm3/actions/mapActions';
import { isActionOf } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { Track } from 'fm3/types/trackingTypes';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { trackingTrackSelector } from 'fm3/selectors/mainSelectors';

let prevTrack: Track | undefined;

export const trackingFollowProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ dispatch, getState, action }) => {
    const track = trackingTrackSelector(getState());

    const differs = prevTrack !== track;
    prevTrack = track;

    if (
      track &&
      !isActionOf(trackingActions.setActive, action) &&
      differs &&
      track.trackPoints.length
    ) {
      const { lat, lon } = track.trackPoints[track.trackPoints.length - 1];
      dispatch(mapRefocus({ lat, lon }));
    }
  },
};
