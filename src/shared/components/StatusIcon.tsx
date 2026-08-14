import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement, ReactNode } from 'react';

type Props = {
  /** Stands for the state on its own; what it means is in the tooltip. */
  icon: ReactNode;
  /** Bootstrap text colour suffix — `warning`, `danger`, `info`, `success`. */
  color?: string;
  /** Read out in place of the icon. */
  label?: string;
  /** What the state is and what to do about it. */
  tooltip?: ReactNode;
  className?: string;
};

/**
 * Marks a state of the content a toolbar belongs to — unsaved changes, a save
 * that hasn't reached the server. Shared so the toolbars that show these can't
 * drift apart in appearance, spacing, or what a screen reader announces; a
 * toolbar has no room for a label, so the tooltip carries the whole message.
 *
 * The margins and the size are the component's own, not the caller's: an icon
 * needs more air than the buttons around it to read as a state rather than a
 * control. They are lopsided on purpose — every button in these toolbars carries
 * `ms-1`, so the gap on the right is already part-paid by whatever follows, and
 * matching `ms` to `me` would leave it visibly wider.
 */
export function StatusIcon({
  icon,
  color = 'warning',
  label,
  tooltip,
  className,
}: Props): ReactElement {
  return (
    <LongPressTooltip label={tooltip}>
      {({ props }) => (
        <span
          role="img"
          className={`align-self-center text-${color} d-inline-flex fs-5 ms-2 me-1${
            className ? ` ${className}` : ''
          }`}
          aria-label={label}
          {...props}
        >
          {icon}
        </span>
      )}
    </LongPressTooltip>
  );
}
