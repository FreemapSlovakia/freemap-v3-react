import { AuthProviders } from '@features/auth/components/AuthProviders.js';
import { AuthProviderSchema } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';

export function AuthProvidersSection(): ReactElement | null {
  const m = useMessages();

  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <>
      {user.authProviders.length < AuthProviderSchema.options.length && (
        <>
          <p>{m?.auth.connect.label}</p>

          <AuthProviders mode="connect" />

          <hr />
        </>
      )}

      <p>{m?.auth.disconnect.label}</p>

      <AuthProviders mode="disconnect" />
    </>
  );
}
