import { mapRefocus } from 'fm3/actions/mapActions';
import { isActionOf } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { Track } from 'fm3/types/trackingTypes';
import { Processor } from 'fm3/middlewares/processorMiddleware';

let prevTrack: Track | undefined;

export const trackingFollowProcessor: Processor = {
  actionCreator: '*',
  handle: async ({ dispatch, getState, action }) => {
    const { tracks, activeTrackId } = getState().tracking;

    // TODO use selector
    const track = activeTrackId
      ? tracks.find(t => t.id === activeTrackId)
      : undefined;

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
