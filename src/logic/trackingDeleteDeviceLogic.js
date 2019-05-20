import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { trackingLoadDevices } from 'fm3/actions/trackingActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { getAuthAxios } from 'fm3/authAxios';

export default createLogic({
  type: at.TRACKING_DELETE_DEVICE,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    getAuthAxios(getState, 204)
      .delete(`${process.env.API_URL}/tracking/devices/${encodeURIComponent(action.payload)}`)
      .then(() => {
        dispatch(trackingLoadDevices());
      })
      .catch((err) => {
        dispatch(toastsAddError('settings.savingError', err)); // TODO
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
