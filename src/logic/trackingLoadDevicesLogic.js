import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { getAuthAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACKING_LOAD_DEVICES,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    getAuthAxios(getState)
      .get('/tracking/devices')
      .then(({ data }) => {
        for (const device of data) {
          device.createdAt = new Date(device.createdAt);
        }
        dispatch(trackingActions.setDevices(data));
      })
      .catch(err => {
        dispatch(toastsAddError('settings.savingError', err)); // TODO
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
