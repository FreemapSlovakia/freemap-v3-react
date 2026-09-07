import {
  BreakpointMatchesContext,
  matchesForWidth,
} from '@shared/breakpoints.js';
import { type ReactElement, type ReactNode, useMemo } from 'react';

type Props = {
  /** The box's own width in pixels; `null` measures against the viewport. */
  width: number | null;
  children: ReactNode;
};

/**
 * Makes everything inside collapse against this box rather than against the
 * viewport — a `breakpoint` or `showFrom` prop keeps its meaning, only the
 * width it is compared with changes. For a panel the user resizes, where a wide
 * screen says nothing about the room a toolbar has.
 */
export function BreakpointsProvider({ width, children }: Props): ReactElement {
  const matches = useMemo(
    () => (width === null ? null : matchesForWidth(width)),
    [width],
  );

  return (
    <BreakpointMatchesContext value={matches}>
      {children}
    </BreakpointMatchesContext>
  );
}
