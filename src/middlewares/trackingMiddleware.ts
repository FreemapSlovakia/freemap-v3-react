import { Dispatch, Middleware } from 'redux';
import { is } from 'typia';
import { rpcCall, rpcResponse } from '../actions/rpcActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { wsClose, wsOpen } from '../actions/websocketActions.js';
import { RootState } from '../store.js';
import { TrackedDevice } from '../types/trackingTypes.js';

export function createTrackingMiddleware(): Middleware<
  {},
  RootState,
  Dispatch
> {
  let reopenTs: number | undefined;

  return ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      if (rpcResponse.match(action)) {
        const { payload } = action;

        if (
          payload.method === 'tracking.subscribe' &&
          payload.type === 'error' &&
          is<{ token: string }>(payload.params)
        ) {
          dispatch(
            toastsAdd({
              id: 'tracking.subscribeError',
              messageKey:
                payload.error.code === 404
                  ? 'tracking.subscribeNotFound'
                  : 'tracking.subscribeError',
              messageParams: {
                id: payload.params.token,
              },
              style: payload.error.code === 404 ? 'warning' : 'danger',
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
          dispatch(
            rpcCall({ method: 'tracking.subscribe', params: mangle(td) }),
          );
        }
      } else if (state === 1 && prevTrackedDevices !== trackedDevices) {
        // TODO prevent concurrent subscribe/unsubscribe of the same id and keep their order
        // TODO ignore if only label changed
        for (const td of prevTrackedDevices) {
          if (trackedDevices.includes(td)) {
            continue;
          }

          const { token, deviceId } = mangle(td);

          dispatch(
            rpcCall({
              method: 'tracking.unsubscribe',
              params: { token, deviceId },
            }),
          );
        }

        for (const td of trackedDevices) {
          if (!prevTrackedDevices.includes(td)) {
            dispatch(
              rpcCall({ method: 'tracking.subscribe', params: mangle(td) }),
            );
          }
        }
      }

      return result;
    };
}

function mangle(td: TrackedDevice) {
  const { token: id, ...rest } = td;

  const isDeviceId = /^\d+$/.test(id.toString());

  const deviceId = isDeviceId
    ? typeof id === 'number'
      ? id
      : Number.parseInt(id, 10)
    : id;

  return {
    deviceId: isDeviceId ? deviceId : undefined,
    token: isDeviceId ? undefined : deviceId,
    ...rest,
  };
}
