import { Text } from '@features/l10n/Text.js';
import type { ReactElement } from 'react';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';

type Props = { id: number };

/**
 * "Changeset #123", one way wherever a changeset is named; a component, so the
 * changesets messages load only where one is.
 */
export function ChangesetLabel({ id }: Props): ReactElement {
  const cm = useChangesetsMessages();

  return (
    <>
      <Text m={cm} k="changeset" /> #{id}
    </>
  );
}
