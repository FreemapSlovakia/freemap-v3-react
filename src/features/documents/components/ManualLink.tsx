import { ShowModalLink } from '@shared/components/ShowModalLink.js';
import type { ReactNode } from 'react';

type Props = {
  chapter: string;
  children: ReactNode;
};

/** Opens a manual chapter, for links inside translated message JSX. */
export function ManualLink({ chapter, children }: Props) {
  return (
    <ShowModalLink modal={{ type: 'manual', chapter }}>
      {children}
    </ShowModalLink>
  );
}
