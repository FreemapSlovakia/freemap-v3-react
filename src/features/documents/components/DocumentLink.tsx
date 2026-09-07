import { ShowModalLink } from '@shared/components/ShowModalLink.js';
import type { ReactNode } from 'react';
import type { Document } from '../model/actions.js';

type Props = {
  doc: Document;
  children: ReactNode;
};

/** Names a document by key, where `ShowModalLink`'s modal shape reads poorly —
 * chiefly inside translated message JSX. */
export function DocumentLink({ doc, children }: Props) {
  return (
    <ShowModalLink modal={{ type: 'document', key: doc }}>
      {children}
    </ShowModalLink>
  );
}
