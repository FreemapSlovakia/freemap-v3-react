import { authLoginWithOsm2 } from 'fm3/actions/authActions';
import { MyStore } from './storeCreator';

export function attachOsmLoginMessageHandler(store: MyStore): void {
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

    const code = new URLSearchParams(e.data.freemap.payload).get('code');

    if (code) {
      store.dispatch(authLoginWithOsm2(code));
    }
  });
}
