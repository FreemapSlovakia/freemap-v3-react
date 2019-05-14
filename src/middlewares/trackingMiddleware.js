import { wsClose, wsOpen, rpcCall } from 'fm3/actions/websocketActions';

export default ({ dispatch, getState }) => next => (action) => {
  const prevState = getState().websocket.state;
  const prevTrackedDevices = getState().tracking.trackedDevices;

  next(action);

  // TODO prevent concurrent subscribe/unsubscribe of the same id and keep their order

  if (getState().tracking.trackedDevices.length === 0 && getState().websocket.state < 2) {
    dispatch(wsClose());
  } else if (getState().tracking.trackedDevices.length > 0 && getState().websocket.state === 3) {
    dispatch(wsOpen());
  } else if (prevState !== 1 && getState().websocket.state === 1 && getState().tracking.trackedDevices.length > 0) {
    for (const td of getState().tracking.trackedDevices) {
      dispatch(rpcCall('tracking.subscribe', td));
    }
  } else if (getState().websocket.state === 1 && prevTrackedDevices !== getState().tracking.trackedDevices) {
    // TODO handle change with subscribe / unsubscribe (also "resubscribe")
  }
};
