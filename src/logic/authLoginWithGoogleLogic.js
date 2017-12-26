import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser } from 'fm3/actions/authActions';
import getAuth2 from 'fm3/gapiLoader';

export default createLogic({
  type: 'AUTH_LOGIN_WITH_GOOGLE',
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    /* eslint-disable indent */
    getAuth2()
      .then(([auth2]) => auth2.signIn())
      .then(googleUser => googleUser.getAuthResponse().id_token)
      .then(idToken => axios(`${process.env.API_URL}/auth/login-google`, {
        method: 'post',
        validateStatus: status => status === 200,
        data: { idToken },
      }))
      .then(({ data }) => {
        dispatch(toastsAdd({
          collapseKey: 'login',
          message: 'Boli ste úspešne prihlásený.',
          style: 'info',
          timeout: 5000,
        }));
        dispatch(authSetUser(data));
      })
      .catch((err) => {
        if (!['popup_closed_by_user', 'access_denied'].includes(err.error)) {
          dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
        }
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});
