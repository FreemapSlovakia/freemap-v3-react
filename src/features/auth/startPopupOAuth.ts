import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';
import {
  type PopupOAuthProvider,
  popupOAuthProviders,
} from './popupOAuthProviders.js';

/**
 * Opens the provider's OAuth2 authorize page in a popup. The popup posts the
 * resulting `code` back through `/authCallback.html`, which the
 * `oauthLoginMessageHandler` turns into an `authWithOAuthCode` action. This
 * promise resolves once the popup is closed.
 *
 * Must be called synchronously from a user-gesture handler so `window.open`
 * is not blocked — the API `GET` happens after, but the window is opened first.
 */
export async function startPopupOAuth(
  provider: PopupOAuthProvider,
  connect: boolean,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<void> {
  const cfg = popupOAuthProviders[provider];

  const res = await httpRequest({
    getState,
    method: 'GET',
    url: cfg.loginPath,
    expectedStatus: 200,
  });

  const { clientId } = await res.json();

  // open window within user gesture handler (before further awaits)
  const w = window.open(
    cfg.authorizeUrl +
      '?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: location.origin + '/authCallback.html',
        scope: cfg.scope,
        state: `${provider}:${connect}`,
        ...cfg.extraParams,
      }).toString(),
    `${provider}-login`,
    `width=600,height=550,left=${window.screen.width / 2 - 600 / 2},top=${
      window.screen.height / 2 - 550 / 2
    }`,
  );

  if (!w) {
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

  await new Promise<void>((resolve) => {
    const ref = window.setInterval(() => {
      if (w.closed) {
        window.clearInterval(ref);

        resolve();
      }
    });
  });
}
