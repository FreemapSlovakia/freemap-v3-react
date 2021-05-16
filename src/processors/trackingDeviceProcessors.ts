import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { Device } from 'fm3/types/trackingTypes';
import { assertType } from 'typescript-is';

export const saveDeviceProcessor: Processor<typeof trackingActions.saveDevice> =
  {
    actionCreator: trackingActions.saveDevice,
    errorKey: 'general.savingError',
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

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          messageKey: 'general.saved',
        }),
      );
    },
  };

export const loadDevicesProcessor: Processor<
  typeof trackingActions.loadDevices
> = {
  actionCreator: trackingActions.loadDevices,
  errorKey: 'general.loadError',
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

    dispatch(trackingActions.setDevices(assertType<Device[]>(data)));
  },
};

export const deleteDeviceProcessor: Processor<
  typeof trackingActions.deleteDevice
> = {
  actionCreator: trackingActions.deleteDevice,
  errorKey: 'general.deleteError',
  handle: async ({ dispatch, getState, action }) => {
    await httpRequest({
      getState,
      method: 'DELETE',
      url: `/tracking/devices/${encodeURIComponent(action.payload)}`,
      expectedStatus: 204,
    });

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'general.deleted',
      }),
    );

    dispatch(trackingActions.loadDevices());
  },
};
