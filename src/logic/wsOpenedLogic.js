import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';
import { wsSend } from 'fm3/websocketActions';

export default createLogic({
  type: at.WS_OPENED,
  process({ getState }, dispatch, done) {
    for (const { id, fromTime, maxCount, maxAge } of getState().tracking.trackedDevices) {
      dispatch(wsSend({
        // TODO id
        jsonrpc: '2.0',
        method: 'tracking.subscribe',
        [/^\d+$/.test(id) ? 'deviceId' : 'token']: id,
        params: {
          fromTime,
          maxCount,
          maxAge,
        },
      }));
    }
    done();
  },
});
