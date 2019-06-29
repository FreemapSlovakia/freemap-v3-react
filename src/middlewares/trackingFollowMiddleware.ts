import { mapRefocus } from 'fm3/actions/mapActions';
import { Middleware, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { isActionOf } from 'typesafe-actions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { ITrack } from 'fm3/types/trackingTypes';

let prevTrack: ITrack | undefined;

export const trackingFollowMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => async (action: RootAction) => {
  next(action);

  const { tracks, activeTrackId } = getState().tracking;

  const track = activeTrackId
    ? tracks.find(t => t.id === activeTrackId)
    : undefined;

  if (
    track &&
    !isActionOf(trackingActions.setActive, action) &&
    prevTrack !== track &&
    track.trackPoints.length
  ) {
    const { lat, lon } = track.trackPoints[track.trackPoints.length - 1];
    dispatch(mapRefocus({ lat, lon }));
  }

  prevTrack = track;
};
