import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { mapRefocus } from 'fm3/actions/mapActions';

let prevTrack;

export default createLogic({
  type: '*',
  process({ getState, action }, dispatch, done) {
    const { tracks, activeTrackId } = getState().tracking;

    const track = activeTrackId && tracks.find(t => t.id === activeTrackId);

    if (track && action.type !== at.TRACKING_SET_ACTIVE && prevTrack !== track && track.trackPoints.length) {
      const { lat, lon } = track.trackPoints[track.trackPoints.length - 1];
      dispatch(mapRefocus({ lat, lon }));
    }

    prevTrack = track;
    done();
  },
});
