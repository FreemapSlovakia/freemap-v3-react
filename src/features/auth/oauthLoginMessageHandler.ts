import { MyStore } from '@app/store/store.js';
import { authWithOAuthCode } from './model/actions.js';
import {
  pendingOAuthLogins,
  popupOAuthProviders,
} from './popupOAuthProviders.js';

// Receives the OAuth callback relayed by `/authCallback.html`. The popup encodes
// the provider, `connect` flag and a per-login nonce in the `state` parameter as
// `provider:connect:nonce`. Only the instance that started the login (the one
// holding the nonce) acts on it — this scopes the callback to the right tab and
// guarantees the single-use code is redeemed exactly once.
export function attachOAuthLoginMessageHandler(store: MyStore): void {
  const bc = new BroadcastChannel('freemap-oauth');

  bc.onmessage = (e) => {
    if (!e.data?.search) {
      return;
    }

    const sp = new URLSearchParams(e.data.search);

    const code = sp.get('code');

    const [provider, connect, nonce] = (sp.get('state') ?? '').split(':');

    if (!nonce || !pendingOAuthLogins.has(nonce)) {
      return; // not started by this tab, or already handled
    }

    pendingOAuthLogins.delete(nonce);

    bc.postMessage({ ok: true }); // tell the popup it can close

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
