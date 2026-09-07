import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaUndo } from 'react-icons/fa';

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
    <Button
      variant="secondary"
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      <FaUndo /> {m?.general.resetToDefaults}
    </Button>
  );
}
