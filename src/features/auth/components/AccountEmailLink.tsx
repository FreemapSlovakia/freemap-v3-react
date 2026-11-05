import { ShowModalLink } from '@shared/components/ShowModalLink.js';
import type { ReactElement, ReactNode } from 'react';

/** Opens the account where its email address is set. */
export function AccountEmailLink({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <ShowModalLink modal={{ type: 'account', section: 'personal' }}>
      {children}
      &nbsp;›
    </ShowModalLink>
  );
}
