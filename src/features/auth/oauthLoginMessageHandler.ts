import { MyStore } from '@app/store/store.js';
import { authWithOAuthCode } from './model/actions.js';
import { popupOAuthProviders } from './popupOAuthProviders.js';

// Receives the OAuth callback relayed by `/authCallback.html`. The popup encodes
// the provider and `connect` flag in the `state` parameter as `provider:connect`.
export function attachOAuthLoginMessageHandler(store: MyStore): void {
  const bc = new BroadcastChannel('freemap-osm-auth');

  bc.onmessage = (e) => {
    if (!e.data?.search) {
      return;
    }

    bc.postMessage({ ok: true });

    const sp = new URLSearchParams(e.data.search);

    const code = sp.get('code');

    const [provider, connect] = (sp.get('state') ?? '').split(':');

    if (code && provider && provider in popupOAuthProviders) {
      store.dispatch(
        authWithOAuthCode({
          provider: provider as keyof typeof popupOAuthProviders,
          code,
          connect: connect === 'true',
        }),
      );
    }
  };
}
