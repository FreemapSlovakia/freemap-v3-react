import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { SiGarmin, SiOpenstreetmap } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import {
  authDisconnect,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithOsm,
} from '../actions/authActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import type { AuthProvider } from '../types/auth.js';

type Props = { mode: 'login' | 'connect' | 'disconnect' };

export function AuthProviders({ mode }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const authProviders = useAppSelector(
    (state) => state.auth.user?.authProviders,
  );

  const cookieConsentResult = useAppSelector(
    (state) => state.main.cookieConsentResult,
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
          onClick={loginWithFacebook}
          size="lg"
          style={{ backgroundColor: '#3b5998', color: '#fff' }}
          disabled={disabled('facebook')}
        >
          <FaFacebook />
          &ensp;{m?.auth.provider.facebook}
        </Button>
      )}

      {show('google') && (
        <Button
          onClick={loginWithGoogle}
          size="lg"
          style={{ backgroundColor: '#DB4437', color: '#fff' }}
          disabled={disabled('google')}
        >
          <FaGoogle />
          &ensp;{m?.auth.provider.google}
        </Button>
      )}

      {show('osm') && (
        <Button
          onClick={loginWithOsm}
          size="lg"
          style={{ backgroundColor: '#8bdc81', color: '#585858' }}
          disabled={disabled('osm')}
        >
          <SiOpenstreetmap />
          &ensp;{m?.auth.provider.osm}
        </Button>
      )}

      {show('garmin') && (
        <Button
          onClick={loginWithGarmin}
          size="lg"
          style={{ backgroundColor: '#1791FF', color: '#fff' }}
          disabled={disabled('garmin')}
        >
          <SiGarmin style={{ fontSize: '400%', marginBlock: '-24px' }} />
          &ensp;
          {m?.auth.provider.garmin}
        </Button>
      )}
    </div>
  );
}
