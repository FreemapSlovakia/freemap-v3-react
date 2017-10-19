import qs from 'query-string';
import axios from 'axios';

import { setHomeLocation, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser } from 'fm3/actions/authActions';

export default function initAuthHelper(store) {
  try {
    store.dispatch(authSetUser(JSON.parse(localStorage.getItem('user'))));
  } catch (e) {
    const authToken = localStorage.getItem('authToken'); // for compatibility
    if (authToken) {
      store.dispatch(authSetUser({ authToken, name: '...' }));
    }
  } finally {
    localStorage.removeItem('authToken'); // for compatibility
  }

  const { user } = store.getState().auth;
  if (user) {
    const pid = Math.random();
    store.dispatch(startProgress(pid));
    axios({
      url: `${process.env.API_URL}/auth/validate`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${user.authToken}`,
      },
      validateStatus: status => status === 200 || status === 401,
    })
      .then((res) => {
        if (res.status === 200) {
          store.dispatch(authSetUser(res.data));
        } else {
          store.dispatch(authSetUser(null));
        }
      })
      .catch((err) => {
        store.dispatch(toastsAddError(`Nepodarilo sa overiť prihlásenie: ${err.message}`));
      })
      .then(() => {
        store.dispatch(stopProgress(pid));
      });
  }

  window.addEventListener('message', (e) => {
    /* eslint-disable no-underscore-dangle */

    if (e.origin !== window.location.origin || typeof e.data !== 'object' || !e.data.__freemap || !e.data.__freemap.oauthParams) {
      return;
    }

    const { oauth_token: token, oauth_verifier: verifier } = qs.parse(e.data.__freemap.oauthParams);

    const pid = Math.random();
    store.dispatch(startProgress(pid));
    axios.post(
      `${process.env.API_URL}/auth/login2`,
      { token, verifier },
      {
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        if (!store.getState().main.homeLocation) {
          store.dispatch(setHomeLocation({ lat: data.lat, lon: data.lon }));
        }

        store.dispatch(toastsAdd({
          collapseKey: 'login',
          message: 'Boli ste úspešne prihlásený.',
          style: 'info',
          timeout: 5000,
        }));

        store.dispatch(authSetUser(data));
      })
      .catch((err) => {
        store.dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
      })
      .then(() => {
        store.dispatch(stopProgress(pid));
      });
  });
}
