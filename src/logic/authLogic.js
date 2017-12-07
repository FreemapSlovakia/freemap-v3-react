import axios from 'axios';
import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authLogout, authSetUser } from 'fm3/actions/authActions';
import getAuth2 from 'fm3/gapiLoader';

const authLoginWithOsmLogic = createLogic({
  type: 'AUTH_LOGIN_WITH_OSM',
  process(params, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const w = window.open(
      'about:blank', 'osm-login',
      `width=600,height=550,left=${window.screen.width / 2 - 600 / 2},top=${window.screen.height / 2 - 550 / 2}`,
    );

    axios(`${process.env.API_URL}/auth/login`, {
      method: 'post',
      validateStatus: status => status === 200,
    })
      .then(({ data }) => {
        if (data.redirect) {
          w.location = data.redirect;
        }
      })
      .catch((err) => {
        dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

const authLoginWithFacebookLogic = createLogic({
  type: 'AUTH_LOGIN_WITH_FACEBOOK',
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

const authLoginWithGoogleLogic = createLogic({
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

const authLogoutLogic = createLogic({
  type: 'AUTH_START_LOGOUT',
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

let prevUser = null;

const saveUserLogic = createLogic({
  type: '*',
  process({ getState }, dispatch, done) {
    const { user } = getState().auth;
    if (user !== prevUser) {
      prevUser = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    done();
  },
});

export default [authLoginWithOsmLogic, authLoginWithFacebookLogic, authLoginWithGoogleLogic, authLogoutLogic, saveUserLogic];
