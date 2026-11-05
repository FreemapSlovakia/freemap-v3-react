import { Text } from '@features/l10n/Text.js';
import type { ReactElement } from 'react';
import { useAuthMessages } from '../translations/useAuthMessages.js';
import { AccountEmailLink } from './AccountEmailLink.js';

/** The page-top strip's text for an address not confirmed yet. */
export function UnconfirmedEmailBar(): ReactElement {
  const am = useAuthMessages();

  return (
    <>
      <Text m={am} k="account.emailUnconfirmedBar" />{' '}
      <AccountEmailLink>
        <Text m={am} k="account.emailUnconfirmedBarLink" />
      </AccountEmailLink>
    </>
  );
}
