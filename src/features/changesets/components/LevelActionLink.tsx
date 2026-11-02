import type { ReactElement, ReactNode } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';

type Props = { href: string; children: ReactNode };

/**
 * An outward link styled as the toast's own action row, for one only this
 * breadcrumb level has — the toast's actions stay the same across levels.
 */
export function LevelActionLink({ href, children }: Props): ReactElement {
  return (
    <ButtonToolbar className="mt-2 gap-2">
      <Button size="sm" href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Button>
    </ButtonToolbar>
  );
}
