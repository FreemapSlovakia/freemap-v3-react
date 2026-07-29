import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement, ReactNode } from 'react';

type Props = {
  /** The detail behind the phrase, shown in the tooltip. */
  hint: ReactNode;
  children: ReactNode;
};

/**
 * Inline phrase with an explanation behind it, marked by a dotted underline and
 * revealed on hover or touch long-press. A `title` attribute would say the same
 * thing, but only to a mouse — a finger never gets at it.
 */
export function HintTooltip({ hint, children }: Props): ReactElement {
  return (
    <LongPressTooltip label={hint}>
      {({ props }) => (
        <span {...props} className="fm-hint">
          {children}
        </span>
      )}
    </LongPressTooltip>
  );
}
