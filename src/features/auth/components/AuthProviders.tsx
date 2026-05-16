import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { SiGarmin, SiOpenstreetmap } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import {
  authDisconnect,
  authWithApple,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithOsm,
} from '../model/actions.js';
import type { AuthProvider } from '../model/types.js';

type Props = { mode: 'login' | 'connect' | 'disconnect' };

export function AuthProviders({ mode }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const authProviders = useAppSelector(
    (state) => state.auth.user?.authProviders,
  );

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const loginWithFacebook = useCallback(() => {
    if (mode === 'disconnect' && !window.confirm(m?.general.areYouSure)) {
      return;
    }

    dispatch(
      mode === 'disconnect'
        ? authDisconnect({ provider: 'facebook' })
        : authWithFacebook({ connect: mode === 'connect' }),
    );
  }, [dispatch, mode, m]);

  const loginWithGoogle = useCallback(() => {
    if (mode === 'disconnect' && !window.confirm(m?.general.areYouSure)) {
      return;
    }

    dispatch(
      mode === 'disconnect'
        ? authDisconnect({ provider: 'google' })
        : authWithGoogle({ connect: mode === 'connect' }),
    );
  }, [dispatch, mode, m]);

  const loginWithApple = useCallback(() => {
    if (mode === 'disconnect' && !window.confirm(m?.general.areYouSure)) {
      return;
    }

    dispatch(
      mode === 'disconnect'
        ? authDisconnect({ provider: 'apple' })
        : authWithApple({ connect: mode === 'connect' }),
    );
  }, [dispatch, mode, m]);

  const loginWithOsm = useCallback(() => {
    if (mode === 'disconnect' && !window.confirm(m?.general.areYouSure)) {
      return;
    }

    dispatch(
      mode === 'disconnect'
        ? authDisconnect({ provider: 'osm' })
        : authWithOsm({ connect: mode === 'connect' }),
    );
  }, [dispatch, mode, m]);

  const loginWithGarmin = useCallback(() => {
    if (mode === 'disconnect' && !window.confirm(m?.general.areYouSure)) {
      return;
    }

    dispatch(
      mode === 'disconnect'
        ? authDisconnect({ provider: 'garmin' })
        : authWithGarmin({ connect: mode === 'connect' }),
    );
  }, [dispatch, mode, m]);

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
      {show('facebook') && (
        <Button
          size="lg"
          leftSection={<FaFacebook />}
          style={{ backgroundColor: '#3b5998', color: '#fff' }}
          onClick={loginWithFacebook}
          disabled={disabled('facebook')}
        >
          Facebook
        </Button>
      )}

      {show('google') && (
        <Button
          size="lg"
          leftSection={<FaGoogle />}
          style={{ backgroundColor: '#DB4437', color: '#fff' }}
          onClick={loginWithGoogle}
          disabled={disabled('google')}
        >
          Google
        </Button>
      )}

      {show('apple') && (
        <Button
          size="lg"
          leftSection={<FaApple />}
          style={{ backgroundColor: '#000', color: '#fff' }}
          onClick={loginWithApple}
          disabled={disabled('apple')}
        >
          Apple
        </Button>
      )}

      {show('osm') && (
        <Button
          size="lg"
          leftSection={<SiOpenstreetmap />}
          style={{ backgroundColor: '#8bdc81', color: '#585858' }}
          onClick={loginWithOsm}
          disabled={disabled('osm')}
        >
          OpenStreetMap
        </Button>
      )}

      {show('garmin') && (
        <Button
          size="lg"
          leftSection={
            <SiGarmin style={{ fontSize: '400%', marginBlock: '-24px' }} />
          }
          style={{ backgroundColor: '#1791FF', color: '#fff' }}
          onClick={loginWithGarmin}
          disabled={disabled('garmin')}
        >
          Garmin
        </Button>
      )}
    </div>
  );
}
