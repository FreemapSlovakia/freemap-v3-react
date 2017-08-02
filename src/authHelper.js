/* eslint-disable no-underscore-dangle */

import qs from 'query-string';

import { API_URL } from 'fm3/backendDefinitions';

import { setHomeLocation, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser } from 'fm3/actions/authActions';

export default function initAuthHelper(store) {
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    const pid = Math.random();
    store.dispatch(startProgress(pid));
    fetch(`${API_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        Accept: 'applicaction/json',
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          return null;
        } else if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          store.dispatch(authSetUser(data));
        }
      })
      .catch((err) => {
        store.dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
      })
      .then(() => {
        store.dispatch(stopProgress(pid));
      });
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || typeof e.data !== 'object' || !e.data.__freemap || !e.data.__freemap.oauthParams) {
      return;
    }

    const { oauth_token: token, oauth_verifier: verifier } = qs.parse(e.data.__freemap.oauthParams);

    const pid = Math.random();
    store.dispatch(startProgress(pid));
    fetch(`${API_URL}/auth/login2`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, verifier }),
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Server vrátil neočakávaný status: ${res.status}`);
        } else {
          return res.json();
        }
      })
      .then((data) => {
        localStorage.setItem('authToken', data.authToken);

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
