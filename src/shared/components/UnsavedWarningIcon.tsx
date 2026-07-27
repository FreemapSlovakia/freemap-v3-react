import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement, ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

type Props = {
  /** Read out in place of the icon. */
  label?: string;
  /** What is unsaved and how to keep it. */
  tooltip?: ReactNode;
  className?: string;
};

/**
 * Marks content that would be lost as it stands — a map with unsaved changes, a
 * track in no saved map. Shared so the toolbars that show it can't drift apart
 * in appearance or in what a screen reader announces.
 */
export function UnsavedWarningIcon({
  label,
  tooltip,
  className,
}: Props): ReactElement {
  return (
    <LongPressTooltip label={tooltip}>
      {({ props }) => (
        <span
          role="img"
          className={`align-self-center text-warning d-inline-flex${
            className ? ` ${className}` : ''
          }`}
          aria-label={label}
          {...props}
        >
          <FaExclamationTriangle />
        </span>
      )}
    </LongPressTooltip>
  );
}
