import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress, setActiveModal } from 'fm3/actions/mainActions';

import * as at from 'fm3/actionTypes';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default createLogic({
  type: at.TRACKING_SAVE_DEVICE,
  process({ getState, action }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    axios.post(
      `${process.env.API_URL}/tracking/devices`,
      action.payload,
      {
        headers: {
          Authorization: `Bearer ${getState().auth.user.authToken}`,
        },
        validateStatus: status => status === 200,
      },
    )
      .then(() => {
        dispatch(setActiveModal('tracking'));
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
