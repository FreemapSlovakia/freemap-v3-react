import { StatusIcon } from '@shared/components/StatusIcon.js';
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
 * track in no saved map. The triangle is this state's alone, so a toolbar that
 * also reports how a save is getting to the server stays readable at a glance.
 */
export function UnsavedWarningIcon({
  label,
  tooltip,
  className,
}: Props): ReactElement {
  return (
    <StatusIcon
      icon={<FaExclamationTriangle />}
      label={label}
      tooltip={tooltip}
      className={className}
    />
  );
}
