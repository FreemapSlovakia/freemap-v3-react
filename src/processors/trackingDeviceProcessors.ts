import { trackingActions } from 'fm3/actions/trackingActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const saveDeviceProcessor: Processor<
  typeof trackingActions.saveDevice
> = {
  actionCreator: trackingActions.saveDevice,
  errorKey: 'tracking.savingError', // TODO
  handle: async ({ dispatch, getState, action }) => {
    const { modifiedDeviceId } = getState().tracking;

    if (modifiedDeviceId) {
      await httpRequest({
        getState,
        method: 'put',
        url: `/tracking/devices/${modifiedDeviceId}`,
        data: action.payload,
      });
      dispatch(trackingActions.modifyDevice(undefined));
    } else {
      await httpRequest({
        getState,
        method: 'post',
        url: '/tracking/devices',
        data: action.payload,
      });
      dispatch(trackingActions.modifyDevice(undefined));
    }
  },
};

export const loadDevicesProcessor: Processor<
  typeof trackingActions.loadDevices
> = {
  actionCreator: trackingActions.loadDevices,
  errorKey: 'tracking.loadError', // TODO
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
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
  },
};

export const deleteDeviceProcessor: Processor<
  typeof trackingActions.deleteDevice
> = {
  actionCreator: trackingActions.deleteDevice,
  errorKey: 'tracking.deleteError', // TODO
  handle: async ({ dispatch, getState, action }) => {
    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/tracking/devices/${encodeURIComponent(action.payload)}`,
      expectedStatus: 204,
    });
    dispatch(trackingActions.loadDevices());
  },
};
