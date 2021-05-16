import { RootAction } from 'fm3/actions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { rpcCall, rpcResponse } from 'fm3/actions/rpcActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { wsClose, wsOpen } from 'fm3/actions/websocketActions';
import { TrackedDevice } from 'fm3/types/trackingTypes';
import { DefaultRootState } from 'react-redux';
import { Dispatch, Middleware } from 'redux';
import { isActionOf } from 'typesafe-actions';
import { is } from 'typescript-is';

export function createTrackingMiddleware(): Middleware<
  unknown,
  DefaultRootState,
  Dispatch
> {
  let reopenTs: number | undefined;

  return ({ dispatch, getState }) =>
    (next: Dispatch) =>
    (action: RootAction): unknown => {
      if (
        isActionOf(setActiveModal, action) &&
        action.payload === 'tracking-my' &&
        !getState().auth.user
      ) {
        return next(
          toastsAdd({
            messageKey: 'tracking.unauthenticatedError',
            style: 'danger',
          }),
        );
      }

      if (isActionOf(rpcResponse, action)) {
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
