import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';
import { wsOpen } from 'fm3/actions/websocketActions';

export default createLogic({
  type: [at.WS_CLOSED, at.WS_ERRORED],
  process({ getState }, dispatch, done) {
    if (getState().tracking.trackedDevices.length) {
      dispatch(wsOpen());
    }
    done();
  },
});
