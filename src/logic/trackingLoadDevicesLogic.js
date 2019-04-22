import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { trackingSetDevices } from 'fm3/actions/trackingActions';

export default createLogic({
  type: at.TRACKING_LOAD_DEVICES,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    axios.get(
      `${process.env.API_URL}/tracking/devices`,
      {
        headers: {
          Authorization: `Bearer ${getState().auth.user.authToken}`,
        },
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        for (const device of data) {
          device.createdAt = new Date(device.createdAt);
        }
        dispatch(trackingSetDevices(data));
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
