// Auth providers that use the OAuth2 authorization-code flow driven through a
// popup window. The popup redirects to `/authCallback.html`, which relays the
// `code` (and `state`) back to the app over a BroadcastChannel; the server then
// exchanges the code for a token (see `makeOAuthLoginHandler` in the API).
export type PopupOAuthProvider = 'osm' | 'github' | 'strava' | 'microsoft';

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
