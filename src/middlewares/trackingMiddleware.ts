import {
  wsClose,
  wsOpen,
  rpcCall,
  rpcResponse,
} from 'fm3/actions/websocketActions';
import { toastsAddError, toastsAdd } from 'fm3/actions/toastsActions';
import { Middleware, Dispatch } from 'redux';
import { getType } from 'typesafe-actions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

let reopenTs;

export const trackingMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => (action: RootAction) => {
  if (
    action.type === getType(setActiveModal) &&
    action.payload === 'tracking-my' &&
    !getState().auth.user
  ) {
    next(toastsAddError('tracking.unauthenticatedError'));
    return;
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

  next(action);

  const { trackedDevices } = getState().tracking;
  const { state, timestamp } = getState().websocket;

  if (prevState === state && prevTrackedDevices === trackedDevices) {
    return;
  }

  if (trackedDevices.length === 0 && reopenTs) {
    clearTimeout(reopenTs);
    reopenTs = null;
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
};

function mangle(td) {
  const { id, ...rest } = td;
  const isDeviceId = /^\d+$/.test(id);
  return {
    [isDeviceId ? 'deviceId' : 'token']: isDeviceId
      ? Number.parseInt(id, 10)
      : id,
    ...rest,
  };
}
