import type { Action } from 'redux';

// Auth providers that use the OAuth2 authorization-code flow driven through a
// popup window. The popup redirects to `/authCallback.html`, which relays the
// `code` (and `state`) back to the app over a BroadcastChannel; the server then
// exchanges the code for a token (see `makeOAuthLoginHandler` in the API).
export type PopupOAuthProvider = 'osm' | 'github' | 'microsoft';

// In-flight popup logins for THIS tab, keyed by nonce → optional action to
// dispatch on success. The callback echoes the nonce back in `state`; only the
// tab that started the login holds it, and it's removed on use — so the
// single-use code is redeemed exactly once, by the initiating tab.
// (`BroadcastChannel` reaches every same-origin tab, so without this each open
// tab would race to redeem the same code.)
export const pendingOAuthLogins = new Map<string, Action | undefined>();

type PopupOAuthProviderConfig = {
  authorizeUrl: string;
  scope: string;
  /** API endpoint: GET returns the client ID, POST completes the login. */
  loginPath: string;
};

export const popupOAuthProviders: Record<
  PopupOAuthProvider,
  PopupOAuthProviderConfig
> = {
  osm: {
    authorizeUrl: 'https://www.openstreetmap.org/oauth2/authorize',
    scope: 'read_prefs',
    loginPath: '/auth/login-osm',
  },
  github: {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
    loginPath: '/auth/login-github',
  },
  microsoft: {
    authorizeUrl:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'openid profile email User.Read',
    loginPath: '/auth/login-microsoft',
  },
};
