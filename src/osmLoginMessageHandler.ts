import qs from 'query-string';

import { authLoginWithOsm2 } from 'fm3/actions/authActions';
import { MyStore } from './storeCreator';

export function attachOsmLoginMessageHandler(store: MyStore) {
  // OSM Login handler
  window.addEventListener('message', (e) => {
    if (
      e.origin !== window.location.origin ||
      typeof e.data !== 'object' ||
      typeof e.data.freemap !== 'object' ||
      e.data.freemap.action !== 'osmAuth'
    ) {
      return;
    }

    const { oauth_token: token, oauth_verifier: verifier } = qs.parse(
      e.data.freemap.payload,
    );

    if (typeof token === 'string' && typeof verifier === 'string') {
      store.dispatch(authLoginWithOsm2({ token, verifier }));
    }
  });
}
