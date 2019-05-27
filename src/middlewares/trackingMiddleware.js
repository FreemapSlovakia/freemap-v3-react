import { wsClose, wsOpen, rpcCall } from 'fm3/actions/websocketActions';

let reopenTs;

export default ({ dispatch, getState }) => next => action => {
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
    dispatch(wsClose());
  } else if (trackedDevices.length > 0 && state === 3) {
    const diff = Date.now() - timestamp;
    if (diff > 1000) {
      // TODO scale this value
      dispatch(wsOpen());
    } else {
      reopenTs = setTimeout(() => {
        dispatch(wsOpen());
      }, 1000 - diff);
    }
  } else if (prevState !== 1 && state === 1 && trackedDevices.length > 0) {
    for (const td of trackedDevices) {
      dispatch(rpcCall('tracking.subscribe', mangle(td)));
    }
  } else if (state === 1 && prevTrackedDevices !== trackedDevices) {
    // TODO prevent concurrent subscribe/unsubscribe of the same id and keep their order
    // TODO ignore if only label changed
    for (const td of prevTrackedDevices) {
      if (!trackedDevices.includes(td)) {
        const { token, deviceId } = mangle(td);
        dispatch(rpcCall('tracking.unsubscribe', { token, deviceId }));
      }
    }
    for (const td of trackedDevices) {
      if (!prevTrackedDevices.includes(td)) {
        dispatch(rpcCall('tracking.subscribe', mangle(td)));
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
