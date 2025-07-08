import { authWithOsm2 } from './actions/authActions.js';
import { MyStore } from './store.js';

export function attachOsmLoginMessageHandler(store: MyStore): void {
  const bc = new BroadcastChannel('freemap-osm-auth');

  bc.onmessage = (e) => {
    if (!e.data?.search) {
      return;
    }

    bc.postMessage({ ok: true });

    const sp = new URLSearchParams(e.data.search);

    const code = sp.get('code');

    if (code) {
      store.dispatch(
        authWithOsm2({
          code,
          connect: sp.get('state') === 'true',
        }),
      );
    }
  };
}
