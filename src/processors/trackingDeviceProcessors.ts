import { assert } from 'typia';
import { toastsAdd } from '../actions/toastsActions.js';
import { trackingActions } from '../actions/trackingActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import { Device } from '../types/trackingTypes.js';

export const saveDeviceProcessor: Processor<typeof trackingActions.saveDevice> =
  {
    actionCreator: trackingActions.saveDevice,
    errorKey: 'general.savingError',
    handle: async ({ dispatch, getState, action }) => {
      const { modifiedDeviceId } = getState().tracking;

      window._paq.push([
        'trackEvent',
        'Tracking',
        'saveDevice',
        modifiedDeviceId ? 'modify' : 'create',
      ]);

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
    const res = await httpRequest({
      getState,
      url: '/tracking/devices',
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      for (const device of data) {
        if (device && typeof device === 'object') {
          device.createdAt = new Date(device.createdAt);
        }
      }
    }

    dispatch(trackingActions.setDevices(assert<Device[]>(data)));
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
