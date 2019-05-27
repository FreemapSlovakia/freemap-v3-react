import { createLogic } from 'redux-logic';
import axios from 'axios';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import storage from 'fm3/storage';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.TIPS_PREVENT_NEXT_TIME,
  process({ getState, storeDispatch }, dispatch, done) {
    storage.setItem('preventTips', getState().tips.preventTips);

    if (!getState().auth.user) {
      done();
      return;
    }

    const pid = Math.random();
    dispatch(startProgress(pid));

    axios
      .patch(
        `${process.env.API_URL}/auth/settings`,
        {
          preventTips: getState().tips.preventTips,
        },
        {
          headers: {
            Authorization: `Bearer ${getState().auth.user.authToken}`,
          },
          validateStatus: status => status === 204,
          // cancelToken: source.token,
        },
      )
      .catch(err => {
        dispatch(toastsAddError('settings.savingError', err));
      })
      .then(() => {
        storeDispatch(stopProgress(pid));
        done();
      });
  },
});
