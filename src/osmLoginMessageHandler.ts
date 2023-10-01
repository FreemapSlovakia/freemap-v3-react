import { authLoginWithOsm2 } from 'fm3/actions/authActions';
import qs from 'query-string';
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

    const { code } = qs.parse(e.data.freemap.payload);

    if (typeof code === 'string') {
      store.dispatch(authLoginWithOsm2(code));
    }
  });
}
