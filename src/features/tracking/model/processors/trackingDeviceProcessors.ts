import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import z from 'zod';
import { trackingActions } from '../actions.js';
import { DeviceSchema } from '../types.js';

export const saveDeviceProcessor: Processor<typeof trackingActions.saveDevice> =
  {
    actionCreator: trackingActions.saveDevice,
    errorKey: 'general.savingError',
    handle: async ({ dispatch, getState, action }) => {
      const { modifiedDeviceId } = getState().tracking;

      window._paq.push([
        'trackEvent',
        'Tracking',
        modifiedDeviceId ? 'update' : 'create',
        'device',
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

    dispatch(
      trackingActions.setDevices(z.array(DeviceSchema).parse(await res.json())),
    );
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
