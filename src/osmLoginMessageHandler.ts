import { authWithOsm2 } from './actions/authActions.js';
import { MyStore } from './store.js';

export function attachOsmLoginMessageHandler(store: MyStore): void {
  window.addEventListener('message', (e) => {
    if (
      e.origin !== window.location.origin ||
      typeof e.data !== 'object' ||
      typeof e.data.freemap !== 'object' ||
      e.data.freemap.action !== 'osmAuth'
    ) {
      return;
    }

    const sp = new URLSearchParams(e.data.freemap.payload);

    const code = sp.get('code');

    if (code) {
      store.dispatch(
        authWithOsm2({
          code,
          connect: sp.get('state') === 'true',
        }),
      );
    }
  });
}
