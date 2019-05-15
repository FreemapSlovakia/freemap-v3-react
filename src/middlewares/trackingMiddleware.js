import { wsClose, wsOpen, rpcCall } from 'fm3/actions/websocketActions';

export default ({ dispatch, getState }) => next => (action) => {
  const prevState = getState().websocket.state;
  const prevTrackedDevices = getState().tracking.trackedDevices;

  next(action);

  const { trackedDevices } = getState().tracking;
  const { state } = getState().websocket;

  if (prevState === state && prevTrackedDevices === trackedDevices) {
    return;
  }

  if (trackedDevices.length === 0 && state < 2) {
    dispatch(wsClose());
  } else if (trackedDevices.length > 0 && state === 3) {
    dispatch(wsOpen());
  } else if (prevState !== 1 && state === 1 && trackedDevices.length > 0) {
    for (const td of trackedDevices) {
      dispatch(rpcCall('tracking.subscribe', td));
    }
  } else if (state === 1 && prevTrackedDevices !== trackedDevices) {
    // TODO prevent concurrent subscribe/unsubscribe of the same id and keep their order
    for (const td of prevTrackedDevices) {
      if (!trackedDevices.includes(td)) {
        const { token, deviceId } = td;
        dispatch(rpcCall('tracking.unsubscribe', { token, deviceId }));
      }
    }
    for (const td of trackedDevices) {
      if (!prevTrackedDevices.includes(td)) {
        dispatch(rpcCall('tracking.subscribe', td));
      }
    }
  }
};
