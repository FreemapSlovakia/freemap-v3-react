/* eslint-disable no-underscore-dangle */

import qs from 'query-string';

import { API_URL } from 'fm3/backendDefinitions';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAddError } from 'fm3/actions/toastsActions';

export default function initAuthHelper(store) {
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
        console.log('SUCCESS', data); // TODO
      })
      .catch((err) => {
        store.dispatch(toastsAddError(`Nepodarilo sa prihlásiť: ${err.message}`));
      })
      .then(() => {
        store.dispatch(stopProgress(pid));
      });
  });
}
