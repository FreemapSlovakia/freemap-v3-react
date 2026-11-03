import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';

type Props = {
  onClick: () => void;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Looks like a link in an alert's text, for an act the URL can't express: a
 * link is kept to what opening it in a new tab would reproduce.
 */
export function LinkButton({ onClick, style, children }: Props): ReactElement {
  return (
    <Button
      variant="link"
      className="alert-link p-0 border-0 align-baseline"
      style={{ fontSize: 'inherit', lineHeight: 'inherit', ...style }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
