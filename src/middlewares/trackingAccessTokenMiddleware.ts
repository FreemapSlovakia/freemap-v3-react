import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Middleware, Dispatch } from 'redux';
import { isActionOf } from 'typesafe-actions';

export const trackingAccessTokenMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => async (action: RootAction) => {
  next(action);

  if (isActionOf(trackingActions.saveAccessToken, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { modifiedAccessTokenId } = getState().tracking;

    try {
      if (modifiedAccessTokenId) {
        getAuthAxios(getState).put(
          `/tracking/access-tokens/${modifiedAccessTokenId}`,
          action.payload,
        );
        dispatch(trackingActions.modifyAccessToken(undefined));
      } else {
        getAuthAxios(getState).post(
          `/tracking/devices/${
            getState().tracking.accessTokensDeviceId
          }/access-tokens`,
          action.payload,
        );
        dispatch(trackingActions.modifyAccessToken(undefined));
      }
    } catch (err) {
      dispatch(toastsAddError('tracking.loadError', err)); // TODO
    } finally {
      dispatch(stopProgress(pid));
    }
  } else if (isActionOf(trackingActions.loadDevices, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    try {
      const { data } = await getAuthAxios(getState).get(
        `/tracking/devices/${
          getState().tracking.accessTokensDeviceId
        }/access-tokens`,
      );
      for (const accessToken of data) {
        for (const field of ['createdAt', 'timeFrom', 'timeTo']) {
          accessToken[field] =
            accessToken[field] && new Date(accessToken[field]);
        }
      }
      dispatch(trackingActions.setAccessTokens(data));
    } catch (err) {
      dispatch(toastsAddError('tracking.loadError', err)); // TODO
    } finally {
      dispatch(stopProgress(pid));
    }
  } else if (isActionOf(trackingActions.deleteDevice, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    try {
      await getAuthAxios(getState, 204).delete(
        `/tracking/access-tokens/${encodeURIComponent(action.payload)}`,
      );
      dispatch(trackingActions.loadAccessTokens());
    } catch (err) {
      dispatch(toastsAddError('tracking.deleteError', err)); // TODO
    } finally {
      dispatch(stopProgress(pid));
    }
  }
};
