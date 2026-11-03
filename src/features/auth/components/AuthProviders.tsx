import type { RootState } from '@app/store/store.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useEffect,
} from 'react';
import { Button } from 'react-bootstrap';
import {
  FaApple,
  FaFacebook,
  FaGithub,
  FaGoogle,
  FaMicrosoft,
  FaStrava,
} from 'react-icons/fa';
import { SiGarmin, SiOpenstreetmap } from 'react-icons/si';
import { useDispatch, useStore } from 'react-redux';
import {
  authDisconnect,
  authWithApple,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithPopupOAuth,
} from '../model/actions.js';
import { AUTH_PROVIDER_LABELS, type AuthProvider } from '../model/types.js';
import { isPopupOAuthProvider } from '../popupOAuthProviders.js';
import { prefetchOAuthClientId } from '../startPopupOAuth.js';

type ProviderDef = {
  provider: AuthProvider;
  icon: ReactNode;
  style: CSSProperties;
};

// Ordered by relevance: mainstream consumer providers first, then the
// domain-relevant outdoor/mapping ones, with the niche developer one last.
const PROVIDERS: ProviderDef[] = [
  {
    provider: 'google',
    icon: <FaGoogle />,
    style: { backgroundColor: '#DB4437', color: '#fff' },
  },
  {
    provider: 'facebook',
    icon: <FaFacebook />,
    style: { backgroundColor: '#3b5998', color: '#fff' },
  },
  {
    provider: 'apple',
    icon: <FaApple />,
    style: { backgroundColor: '#000', color: '#fff' },
  },
  {
    provider: 'microsoft',
    icon: <FaMicrosoft />,
    style: { backgroundColor: '#2f2f2f', color: '#fff' },
  },
  {
    provider: 'osm',
    icon: <SiOpenstreetmap />,
    style: { backgroundColor: '#8bdc81', color: '#585858' },
  },
  {
    provider: 'garmin',
    icon: <SiGarmin className="fm-icon-wordmark" />,
    style: { backgroundColor: '#1791FF', color: '#fff' },
  },
  {
    provider: 'strava',
    icon: <FaStrava />,
    style: { backgroundColor: '#fc4c02', color: '#fff' },
  },
  {
    provider: 'github',
    icon: <FaGithub />,
    style: { backgroundColor: '#24292e', color: '#fff' },
  },
];

// Providers whose login is initiated by a dedicated action are listed here;
// everyone else goes through the shared popup OAuth flow.
function loginAction(provider: AuthProvider, connect: boolean) {
  switch (provider) {
    case 'facebook':
      return authWithFacebook({ connect });
    case 'google':
      return authWithGoogle({ connect });
    case 'apple':
      return authWithApple({ connect });
    case 'garmin':
      return authWithGarmin({ connect });
    default:
      return authWithPopupOAuth({ provider, connect });
  }
}

// Strava's single API app accepts only the www.freemap.sk callback domain, so
// its login/connect popup only works there. Disconnect doesn't use the popup,
// so it stays available everywhere.
function isProviderAvailable(
  provider: AuthProvider,
  mode: Props['mode'],
): boolean {
  return (
    provider !== 'strava' ||
    mode === 'disconnect' ||
    location.hostname === 'www.freemap.sk'
  );
}

type Props = { mode: 'login' | 'connect' | 'disconnect' };

export function AuthProviders({ mode }: Props): ReactElement {
  const confirm = useConfirm();

  const online = useOnline();

  const dispatch = useDispatch();

  const authProviders = useAppSelector(
    (state) => state.auth.user?.authProviders,
  );

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const store = useStore<RootState>();

  // For the popup buttons shown, so a click can open the popup at once.
  useEffect(() => {
    if (mode === 'disconnect') {
      return;
    }

    for (const { provider } of PROVIDERS) {
      if (
        isPopupOAuthProvider(provider) &&
        isProviderAvailable(provider, mode) &&
        (mode === 'login' || !authProviders?.includes(provider))
      ) {
        prefetchOAuthClientId(provider, store.getState);
      }
    }
  }, [mode, store, authProviders]);

  const handleClick = async (provider: AuthProvider) => {
    if (mode === 'disconnect') {
      if (!(await confirm())) {
        return;
      }

      dispatch(authDisconnect({ provider }));
    } else {
      dispatch(loginAction(provider, mode === 'connect'));
    }
  };

  function show(provider: AuthProvider) {
    return (
      mode === 'login' ||
      (mode === 'connect' && !authProviders?.includes(provider)) ||
      (mode === 'disconnect' && authProviders?.includes(provider))
    );
  }

  function disabled(provider: AuthProvider) {
    // Every mode here — logging in, connecting, disconnecting — is a request to
    // the server.
    if (!online) {
      return true;
    }

    if (mode === 'login') {
      return cookieConsentResult === null;
    }

    if (!authProviders) {
      return true;
    }

    return mode === 'connect'
      ? authProviders.includes(provider)
      : authProviders.length < 2 || !authProviders.includes(provider);
  }

  return (
    <div className="d-grid gap-2">
      {PROVIDERS.filter(
        (def) => isProviderAvailable(def.provider, mode) && show(def.provider),
      ).map((def) => (
        <Button
          key={def.provider}
          onClick={() => handleClick(def.provider)}
          size="lg"
          style={def.style}
          disabled={disabled(def.provider)}
        >
          {def.icon}
          &ensp;{AUTH_PROVIDER_LABELS[def.provider]}
        </Button>
      ))}
    </div>
  );
}
