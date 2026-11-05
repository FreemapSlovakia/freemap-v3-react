import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';

type Props = { href: string; children: ReactNode };

/** An outward link as an action row, for one only this breadcrumb level has. */
export function LevelActionLink({ href, children }: Props): ReactElement {
  return (
    <ButtonToolbar className="mt-3 gap-2">
      <Button size="sm" href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Button>
    </ButtonToolbar>
  );
}
