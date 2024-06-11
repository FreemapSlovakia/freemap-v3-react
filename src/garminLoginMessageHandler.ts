import { authWithGarmin2 } from 'fm3/actions/authActions';
import { MyStore } from './storeCreator';

export function attachGarminLoginMessageHandler(store: MyStore): void {
  window.addEventListener('message', (e) => {
    if (
      e.origin !== window.location.origin ||
      typeof e.data !== 'object' ||
      typeof e.data.freemap !== 'object' ||
      e.data.freemap.action !== 'garminAuth'
    ) {
      return;
    }

    const sp = new URLSearchParams(e.data.freemap.payload);

    const token = sp.get('oauth_token');

    const verifier = sp.get('oauth_verifier');

    if (token && verifier) {
      store.dispatch(
        authWithGarmin2({
          token,
          verifier,
        }),
      );
    }
  });
}
