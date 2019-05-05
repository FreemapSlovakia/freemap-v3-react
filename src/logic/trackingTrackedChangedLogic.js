import { createLogic } from 'redux-logic';
import { wsSend } from 'fm3/actions/websocketActions';
import { wsOpen } from 'fm3/websocketActions';

let oldValue = [];

export default createLogic({
  type: '*',
  process({ getState }, dispatch, done) {
    const { trackedDevices } = getState().tracking;
    if (oldValue !== trackedDevices) {
      if (getState().ws.state === 'OPENED') {
        const currIds = trackedDevices.map(d => d.id);
        const oldIds = oldValue.map(d => d.id);

        for (const id of oldIds.filter(oldId => !currIds.includes(oldId))) {
          dispatch(wsSend('tracking.unsubscribe', {
            [/^\d+$/.test(id) ? 'deviceId' : 'token']: id,
          }));
        }

        for (const { id, fromTime, maxCount, maxAge } of getState().tracking.trackedDevices) {
          if (!oldIds.includes(id)) {
            dispatch(wsSend('tracking.subscribe', {
              [/^\d+$/.test(id) ? 'deviceId' : 'token']: id,
              fromTime,
              maxCount,
              maxAge,
            }));
          }
        }
      } else if (getState().ws.state === 'CLOSED' && oldValue.length === 0 && trackedDevices.length > 0) {
        dispatch(wsOpen());
      }
      oldValue = trackedDevices;
    }
    done();
  },
});
