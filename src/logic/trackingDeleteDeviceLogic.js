import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { trackingLoadDevices } from 'fm3/actions/trackingActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.TRACKING_DELETE_DEVICE,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    axios.delete(
      `${process.env.API_URL}/tracking/devices/${encodeURIComponent(action.payload)}`,
      {
        headers: {
          Authorization: `Bearer ${getState().auth.user.authToken}`,
        },
        validateStatus: status => status === 204,
      },
    )
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
