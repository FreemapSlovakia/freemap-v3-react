import { trackingActions } from 'fm3/actions/trackingActions';
import { httpRequest } from 'fm3/authAxios';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { dispatchAxiosErrorAsToast } from './utils';

export const saveDeviceProcessor: IProcessor<
  typeof trackingActions.saveDevice
> = {
  actionCreator: trackingActions.saveDevice,
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedDeviceId } = getState().tracking;

    try {
      if (modifiedDeviceId) {
        await httpRequest({
          dispatch,
          getState,
          method: 'put',
          url: `/tracking/devices/${modifiedDeviceId}`,
          body: action.payload,
        });
        dispatch(trackingActions.modifyDevice(undefined));
      } else {
        await httpRequest({
          dispatch,
          getState,
          method: 'post',
          url: '/tracking/devices',
          body: action.payload,
        });
        dispatch(trackingActions.modifyDevice(undefined));
      }
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'tracking.savingError', err); // TODO
    }
  },
};

export const loadDevicesProcessor: IProcessor<
  typeof trackingActions.loadDevices
> = {
  actionCreator: trackingActions.loadDevices,
  handle: async ({ dispatch, getState }) => {
    try {
      const { data } = await httpRequest({
        dispatch,
        getState,
        method: 'GET',
        url: '/tracking/devices',
      });
      if (Array.isArray(data)) {
        for (const device of data) {
          if (device && typeof device === 'object') {
            device.createdAt = new Date(device.createdAt);
          }
        }
      }
      dispatch(trackingActions.setDevices(data));
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'tracking.loadError', err); // TODO
    }
  },
};

export const deleteDeviceProcessor: IProcessor<
  typeof trackingActions.deleteDevice
> = {
  actionCreator: trackingActions.deleteDevice,
  handle: async ({ dispatch, getState, action }) => {
    try {
      await httpRequest({
        dispatch,
        getState,
        method: 'DELETE',
        url: `${process.env.API_URL}/tracking/devices/${encodeURIComponent(
          action.payload,
        )}`,
        expectedStatus: 204,
      });
      dispatch(trackingActions.loadDevices());
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'tracking.deleteError', err); // TODO
    }
  },
};
