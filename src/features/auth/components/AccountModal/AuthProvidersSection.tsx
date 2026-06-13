import { AuthProviders } from '@features/auth/components/AuthProviders.js';
import { AuthProviderSchema } from '@features/auth/model/types.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';

export function AuthProvidersSection(): ReactElement | null {
  const am = useAuthMessages();

  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <>
      {user.authProviders.length < AuthProviderSchema.options.length && (
        <>
          <p>{am?.connectLabel}</p>

          <AuthProviders mode="connect" />

          <hr />
        </>
      )}

      <p>{am?.disconnectLabel}</p>

      <AuthProviders mode="disconnect" />
    </>
  );
}
