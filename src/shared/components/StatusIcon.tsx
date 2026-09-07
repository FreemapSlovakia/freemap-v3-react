import { GlyphMarker } from '@shared/components/GlyphMarker.js';
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
 * drift apart in appearance or in what a screen reader announces; a toolbar has
 * no room for a label, so the tooltip carries the whole message.
 */
export function StatusIcon({
  icon,
  color = 'warning',
  label,
  tooltip,
  className,
}: Props): ReactElement {
  return (
    <GlyphMarker
      role="img"
      aria-label={label}
      hint={tooltip}
      color={color}
      className={className}
    >
      {icon}
    </GlyphMarker>
  );
}
