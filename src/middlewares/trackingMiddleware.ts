import { wsClose, wsOpen } from 'fm3/actions/websocketActions';
import { rpcCall, rpcResponse } from 'fm3/actions/rpcActions';
import { toastsAddError, toastsAdd } from 'fm3/actions/toastsActions';
import { Middleware, Dispatch } from 'redux';
import { getType } from 'typesafe-actions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import { TrackedDevice } from 'fm3/types/trackingTypes';
import { RootAction } from 'fm3/actions';

let reopenTs: number | undefined;

export const trackingMiddleware: Middleware<{}, RootState, Dispatch> = ({
  dispatch,
  getState,
}) => next => (action: RootAction) => {
  if (
    action.type === getType(setActiveModal) &&
    action.payload === 'tracking-my' &&
    !getState().auth.user
  ) {
    return next(toastsAddError('tracking.unauthenticatedError'));
  }

  if (action.type === getType(rpcResponse)) {
    if (
      action.payload.method === 'tracking.subscribe' &&
      action.payload.type === 'error'
    ) {
      dispatch(
        toastsAdd({
          messageKey:
            action.payload.error.code === 404
              ? 'tracking.subscribeNotFound'
              : 'tracking.subscribeError',
          messageParams: {
            id: action.payload.params.token || action.payload.params.deviceId,
          },
          style: action.payload.error.code === 404 ? 'warning' : 'danger',
        }),
      );
    }
  }

  const prevState = getState().websocket.state;
  const prevTrackedDevices = getState().tracking.trackedDevices;

  const result = next(action);

  const { trackedDevices } = getState().tracking;
  const { state, timestamp } = getState().websocket;

  if (prevState === state && prevTrackedDevices === trackedDevices) {
    return result;
  }

  if (trackedDevices.length === 0 && reopenTs) {
    clearTimeout(reopenTs);
    reopenTs = undefined;
  }

  if (trackedDevices.length === 0 && state < 2) {
    dispatch(wsClose(null));
  } else if (trackedDevices.length > 0 && state === 3) {
    const diff = Date.now() - timestamp;
    if (diff > 1000) {
      // TODO scale this value
      dispatch(wsOpen(null));
    } else {
      reopenTs = window.setTimeout(() => {
        dispatch(wsOpen(null));
      }, 1000 - diff);
    }
  } else if (prevState !== 1 && state === 1 && trackedDevices.length > 0) {
    for (const td of trackedDevices) {
      dispatch(rpcCall({ method: 'tracking.subscribe', params: mangle(td) }));
    }
  } else if (state === 1 && prevTrackedDevices !== trackedDevices) {
    // TODO prevent concurrent subscribe/unsubscribe of the same id and keep their order
    // TODO ignore if only label changed
    for (const td of prevTrackedDevices) {
      if (!trackedDevices.includes(td)) {
        const { token, deviceId } = mangle(td);
        dispatch(
          rpcCall({
            method: 'tracking.unsubscribe',
            params: { token, deviceId },
          }),
        );
      }
    }
    for (const td of trackedDevices) {
      if (!prevTrackedDevices.includes(td)) {
        dispatch(rpcCall({ method: 'tracking.subscribe', params: mangle(td) }));
      }
    }
  }

  return result;
};

function mangle(td: TrackedDevice) {
  const { id, ...rest } = td;
  const isDeviceId = /^\d+$/.test(id.toString());
  const xxx = isDeviceId
    ? typeof id === 'number'
      ? id
      : Number.parseInt(id, 10)
    : id;
  return {
    deviceId: isDeviceId ? xxx : undefined,
    token: isDeviceId ? undefined : xxx,
    ...rest,
  };
}
