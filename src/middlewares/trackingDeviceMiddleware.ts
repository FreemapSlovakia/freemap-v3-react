import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Middleware, Dispatch } from 'redux';
import { isActionOf } from 'typesafe-actions';

export const trackingDeviceMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => async (action: RootAction) => {
  next(action);

  if (isActionOf(trackingActions.saveDevice, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { modifiedDeviceId } = getState().tracking;

    try {
      if (modifiedDeviceId) {
        await getAuthAxios(getState).put(
          `/tracking/devices/${modifiedDeviceId}`,
          action.payload,
        );
        dispatch(trackingActions.modifyDevice(undefined));
      } else {
        await getAuthAxios(getState).post('/tracking/devices', action.payload);
        dispatch(trackingActions.modifyDevice(undefined));
      }
    } catch (err) {
      dispatch(toastsAddError('tracking.savingError', err)); // TODO
    } finally {
      dispatch(stopProgress(pid));
    }
  } else if (isActionOf(trackingActions.loadDevices, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    try {
      const { data } = await getAuthAxios(getState).get('/tracking/devices');
      for (const device of data) {
        device.createdAt = new Date(device.createdAt);
      }
      dispatch(trackingActions.setDevices(data));
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
        `${process.env.API_URL}/tracking/devices/${encodeURIComponent(
          action.payload,
        )}`,
      );
      dispatch(trackingActions.loadDevices());
    } catch (err) {
      dispatch(toastsAddError('tracking.deleteError', err)); // TODO
    } finally {
      dispatch(stopProgress(pid));
    }
  }
};
