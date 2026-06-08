import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { type CSSProperties, type ReactNode, useCallback } from 'react';
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
import { useDispatch } from 'react-redux';
import {
  authDisconnect,
  authWithApple,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithPopupOAuth,
} from '../model/actions.js';
import type { AuthProvider } from '../model/types.js';

type ProviderDef = {
  provider: AuthProvider;
  label: string;
  icon: ReactNode;
  style: CSSProperties;
};

// Ordered by relevance: mainstream consumer providers first, then the
// domain-relevant outdoor/mapping ones, with the niche developer one last.
const PROVIDERS: ProviderDef[] = [
  {
    provider: 'google',
    label: 'Google',
    icon: <FaGoogle />,
    style: { backgroundColor: '#DB4437', color: '#fff' },
  },
  {
    provider: 'facebook',
    label: 'Facebook',
    icon: <FaFacebook />,
    style: { backgroundColor: '#3b5998', color: '#fff' },
  },
  {
    provider: 'apple',
    label: 'Apple',
    icon: <FaApple />,
    style: { backgroundColor: '#000', color: '#fff' },
  },
  {
    provider: 'microsoft',
    label: 'Microsoft',
    icon: <FaMicrosoft />,
    style: { backgroundColor: '#2f2f2f', color: '#fff' },
  },
  {
    provider: 'osm',
    label: 'OpenStreetMap',
    icon: <SiOpenstreetmap />,
    style: { backgroundColor: '#8bdc81', color: '#585858' },
  },
  {
    provider: 'garmin',
    label: 'Garmin',
    icon: <SiGarmin style={{ fontSize: '400%', marginBlock: '-24px' }} />,
    style: { backgroundColor: '#1791FF', color: '#fff' },
  },
  {
    provider: 'strava',
    label: 'Strava',
    icon: <FaStrava />,
    style: { backgroundColor: '#fc4c02', color: '#fff' },
  },
  {
    provider: 'github',
    label: 'GitHub',
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

type Props = { mode: 'login' | 'connect' | 'disconnect' };

export function AuthProviders({ mode }: Props): ReactElement {
  const confirm = useConfirm();

  const dispatch = useDispatch();

  const authProviders = useAppSelector(
    (state) => state.auth.user?.authProviders,
  );

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const handleClick = useCallback(
    async (provider: AuthProvider) => {
      if (mode === 'disconnect') {
        if (!(await confirm())) {
          return;
        }

        dispatch(authDisconnect({ provider }));
      } else {
        dispatch(loginAction(provider, mode === 'connect'));
      }
    },
    [dispatch, mode, confirm],
  );

  function show(provider: AuthProvider) {
    return (
      mode === 'login' ||
      (mode === 'connect' && !authProviders?.includes(provider)) ||
      (mode === 'disconnect' && authProviders?.includes(provider))
    );
  }

  function disabled(provider: AuthProvider) {
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
      {PROVIDERS.filter((def) => show(def.provider)).map((def) => (
        <Button
          key={def.provider}
          onClick={() => handleClick(def.provider)}
          size="lg"
          style={def.style}
          disabled={disabled(def.provider)}
        >
          {def.icon}
          &ensp;{def.label}
        </Button>
      ))}
    </div>
  );
}
