import { AuthProviders } from '@features/auth/components/AuthProviders.js';
import { AuthProviderSchema } from '@features/auth/model/types.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { Text } from '@features/l10n/Text.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';

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
          <p>
            <Text m={am} k="connectLabel" />
          </p>

          <AuthProviders mode="connect" />

          <hr />
        </>
      )}

      <p>
        <Text m={am} k="disconnectLabel" />
      </p>

      <AuthProviders mode="disconnect" />
    </>
  );
}
