import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authLogout } from 'fm3/actions/authActions';

export default createLogic({
  type: at.AUTH_START_LOGOUT,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios(`${process.env.API_URL}/auth/logout`, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${getState().auth.user.authToken}`,
      },
      validateStatus: status => status === 204 || status === 401,
    })
      .then(() => {
        dispatch(authLogout());
        dispatch(toastsAdd({
          collapseKey: 'login',
          message: 'Boli ste úspešne odhlásený.',
          style: 'info',
          timeout: 5000,
        }));
      })
      .catch((err) => {
        dispatch(toastsAddError(`Nepodarilo sa odhlásiť: ${err.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
