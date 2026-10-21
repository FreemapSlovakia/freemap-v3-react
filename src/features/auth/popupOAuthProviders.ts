import { stopProgress } from '@features/progress/model/actions.js';
import type { Action, Dispatch } from 'redux';

// Auth providers that use the OAuth2 authorization-code flow driven through a
// popup window. The popup redirects to `/authCallback.html`, which relays the
// `code` (and `state`) back to the app over a BroadcastChannel; the server then
// exchanges the code for a token (see `makeOAuthLoginHandler` in the API).
export type PopupOAuthProvider = 'osm' | 'github' | 'strava' | 'microsoft';

export function isPopupOAuthProvider(
  provider: string,
): provider is PopupOAuthProvider {
  return Object.hasOwn(popupOAuthProviders, provider);
}

/** Progress id held from opening the popup until the login completes or is abandoned. */
export const OAUTH_PROGRESS_ID = 'popupOAuth';

export type PendingOAuthLogin = {
  provider: PopupOAuthProvider;
  successAction: Action | undefined;
  /** Whether its popup still holds `OAUTH_PROGRESS_ID`. */
  holdsProgress: boolean;
};

// This tab's popup logins by the nonce the callback echoes in `state`. The
// callback reaches every tab, so only the one holding the nonce redeems the code.
export const pendingOAuthLogins = new Map<string, PendingOAuthLogin>();

/** Stops the login's hold on `OAUTH_PROGRESS_ID`, if it still has one. */
export function releaseOAuthProgress(
  login: PendingOAuthLogin | undefined,
  dispatch: Dispatch,
): void {
  if (login?.holdsProgress) {
    login.holdsProgress = false;

    dispatch(stopProgress(OAUTH_PROGRESS_ID));
  }
}

/** OSM scope that lets the API upload GPS traces; a plain login doesn't ask for it. */
export const OSM_GPX_SCOPE = 'read_prefs write_gpx';

type PopupOAuthProviderConfig = {
  authorizeUrl: string;
  scope: string;
  /** API endpoint: GET returns the client ID, POST completes the login. */
  loginPath: string;
  extraParams?: Record<string, string>;
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
  strava: {
    authorizeUrl: 'https://www.strava.com/oauth/authorize',
    scope: 'read',
    loginPath: '/auth/login-strava',
    extraParams: { approval_prompt: 'auto' },
  },
  microsoft: {
    authorizeUrl:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'openid profile email User.Read',
    loginPath: '/auth/login-microsoft',
  },
};
