import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import {
  startProgress,
  stopProgress,
} from '@features/progress/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isBroadcastChannelSupported } from '@shared/broadcastChannelSupport.js';
import type { Action, Dispatch } from 'redux';
import {
  OAUTH_PROGRESS_ID,
  type PopupOAuthProvider,
  pendingOAuthLogins,
  popupOAuthProviders,
  releaseOAuthProgress,
} from './popupOAuthProviders.js';

const clientIds = new Map<PopupOAuthProvider, Promise<string>>();

/**
 * The provider's OAuth client id, fetched once. Prefetch it where a popup is
 * about to be offered: a fetch between the click and `window.open` can outlast
 * the click's user activation, and the popup is then blocked.
 */
export function getOAuthClientId(
  provider: PopupOAuthProvider,
  getState: () => RootState,
): Promise<string> {
  let clientId = clientIds.get(provider);

  if (!clientId) {
    clientId = httpRequest({
      getState,
      method: 'GET',
      url: popupOAuthProviders[provider].loginPath,
      expectedStatus: 200,
    })
      .then((res) => res.json())
      .then((body: { clientId: string }) => body.clientId);

    // A failure is not remembered, so the next attempt asks again.
    clientId.catch(() => clientIds.delete(provider));

    clientIds.set(provider, clientId);
  }

  return clientId;
}

/** Fetches the client id ahead of a click that may open the provider's popup. */
export function prefetchOAuthClientId(
  provider: PopupOAuthProvider,
  getState: () => RootState,
): void {
  // A failure is retried on the click.
  getOAuthClientId(provider, getState).catch(() => {});
}

/**
 * Opens the provider's authorize page in a popup, whose code comes back through
 * `oauthLoginMessageHandler`. Call it from a click with the client id
 * prefetched, or the popup is blocked.
 */
export async function startPopupOAuth(
  provider: PopupOAuthProvider,
  connect: boolean,
  getState: () => RootState,
  dispatch: Dispatch,
  successAction?: Action,
  scope?: string,
): Promise<void> {
  if (!isBroadcastChannelSupported()) {
    // The popup relays the OAuth code back over a BroadcastChannel; without it
    // the login could never complete. Warn instead of opening a dead popup.
    dispatch(
      toastsAdd({
        id: 'broadcastChannelUnsupported',
        style: 'warning',
        messageKey: 'general.broadcastChannelUnsupported',
        timeout: 5000,
      }),
    );

    return;
  }

  const cfg = popupOAuthProviders[provider];

  // Not cleared on popup close: under COOP `w.closed` reads true early.
  const nonce = crypto.randomUUID();

  // Held by this call until the login is registered below.
  dispatch(startProgress(OAUTH_PROGRESS_ID));

  let clientId: string;

  try {
    clientId = await getOAuthClientId(provider, getState);
  } catch (err) {
    dispatch(stopProgress(OAUTH_PROGRESS_ID));

    throw err;
  }

  // After the await, so a second click during it supersedes this one too. The
  // provider's popup window is reused, so only the latest login can answer.
  for (const [earlier, login] of pendingOAuthLogins) {
    if (login.provider === provider) {
      pendingOAuthLogins.delete(earlier);

      releaseOAuthProgress(login, dispatch);
    }
  }

  const w = window.open(
    cfg.authorizeUrl +
      '?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: `${location.origin}/authCallback.html`,
        scope: scope ?? cfg.scope,
        state: `${provider}:${connect}:${nonce}`,
        ...cfg.extraParams,
      }).toString(),
    `${provider}-login`,
    `width=600,height=550,left=${window.screen.width / 2 - 600 / 2},top=${
      window.screen.height / 2 - 550 / 2
    }`,
  );

  if (!w) {
    dispatch(stopProgress(OAUTH_PROGRESS_ID));

    dispatch(
      toastsAdd({
        id: 'enablePopup',
        style: 'warning',
        messageKey: 'general.enablePopup',
        timeout: 5000,
      }),
    );

    return;
  }

  // Only now: no callback can arrive before the synchronous `window.open`.
  const login = { provider, successAction, holdsProgress: true };

  pendingOAuthLogins.set(nonce, login);

  // `w.closed` can't tell a cancelled popup (see above), so the user being back
  // in this window with the callback still unanswered counts as the cancel.
  // Focus alone may never come (a popup that didn't take it), hence the press.
  const onBack = () => {
    window.removeEventListener('focus', onBack);

    document.removeEventListener('pointerdown', onBack, true);

    window.setTimeout(() => releaseOAuthProgress(login, dispatch), 1000);
  };

  window.addEventListener('focus', onBack);

  document.addEventListener('pointerdown', onBack, true);

  await new Promise<void>((resolve) => {
    const ref = window.setInterval(() => {
      if (w.closed) {
        window.clearInterval(ref);

        resolve();
      }
    }, 500);
  });
}
