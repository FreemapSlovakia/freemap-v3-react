import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { FaUndo } from 'react-icons/fa';
import { FmFooterButton } from './FmModalFooter.js';

type Props = {
  /** Resets the surrounding form to its defaults. */
  onClick: () => void;
  /** Disable when the form already matches its defaults (nothing to reset). */
  disabled?: boolean;
  className?: string;
};

/**
 * "Reset to default" button shared by the settings and style modals and by the
 * panorama's peak-names menu. Neutral (`secondary`) because putting a setting
 * back is not the main action anywhere it appears. `type="button"` so it never
 * submits the form it may be standing in.
 */
export function ResetToDefaultsButton({
  onClick,
  disabled,
  className,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <FmFooterButton
      variant="secondary"
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
      icon={<FaUndo />}
      label={m?.general.resetToDefaults}
    />
  );
}
