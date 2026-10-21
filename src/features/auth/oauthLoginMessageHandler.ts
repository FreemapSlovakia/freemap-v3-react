import type { MyStore } from '@app/store/store.js';
import { startProgress } from '@features/progress/model/actions.js';
import { authWithOAuthCode } from './model/actions.js';
import {
  OAUTH_PROGRESS_ID,
  pendingOAuthLogins,
  releaseOAuthProgress,
} from './popupOAuthProviders.js';

// Receives the OAuth callback relayed by `/authCallback.html`. The popup encodes
// the provider, `connect` flag and a per-login nonce in the `state` parameter as
// `provider:connect:nonce`. Only the instance that started the login (the one
// holding the nonce) acts on it — this scopes the callback to the right tab and
// guarantees the single-use code is redeemed exactly once.
export function attachOAuthLoginMessageHandler(store: MyStore): void {
  let bc: BroadcastChannel;

  try {
    bc = new BroadcastChannel('freemap-oauth');
  } catch (err) {
    // BroadcastChannel is missing or blocked (unsupported browser / insecure
    // context). The popup OAuth relay simply won't work there; skip it instead
    // of throwing and aborting the rest of app startup.
    console.warn('OAuth login message handler unavailable:', err);

    return;
  }

  bc.onmessage = (e) => {
    if (!e.data?.search) {
      return;
    }

    const sp = new URLSearchParams(e.data.search);

    const code = sp.get('code');

    const [, connect, nonce] = (sp.get('state') ?? '').split(':');

    const login = nonce ? pendingOAuthLogins.get(nonce) : undefined;

    if (!login) {
      return; // not started by this tab, or already handled
    }

    pendingOAuthLogins.delete(nonce);

    bc.postMessage({ ok: true }); // tell the popup it can close

    if (code) {
      // The code exchange owns exactly one hold, which its processor stops: the
      // popup's, handed over, or a new one if a focus-guessed cancel released it.
      if (login.holdsProgress) {
        login.holdsProgress = false;
      } else {
        store.dispatch(startProgress(OAUTH_PROGRESS_ID));
      }

      store.dispatch(
        authWithOAuthCode({
          provider: login.provider,
          code,
          connect: connect === 'true',
          successAction: login.successAction,
        }),
      );
    } else {
      // Denied on the provider's page: no code exchange will end the login.
      releaseOAuthProgress(login, store.dispatch);
    }
  };
}
