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
 * "Reset to default" footer button shared by the settings/style modals. Neutral
 * (`secondary`) because it only refills the form — nothing is saved until the
 * user submits. `type="button"` so it never submits the surrounding form.
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
