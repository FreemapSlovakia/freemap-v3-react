import axios from 'axios';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser } from 'fm3/actions/authActions';

export default createLogic({
  type: at.AUTH_LOGIN_WITH_FACEBOOK,
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        login(response);
      } else {
        window.FB.login((response2) => {
          if (response2.status === 'connected') {
            login(response2);
          } else {
            dispatch(toastsAddError('Nepodarilo sa prihlásiť.'));
            dispatch(stopProgress(pid));
            done();
          }
        }, { scope: 'email' });
      }
    });

    function login(response) {
      axios(`${process.env.API_URL}/auth/login-fb`, {
        method: 'post',
        validateStatus: status => status === 200,
        data: { accessToken: response.authResponse.accessToken },
      })
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
          dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
        })
        .then(() => {
          dispatch(stopProgress(pid));
          done();
        });
    }
  },
});
