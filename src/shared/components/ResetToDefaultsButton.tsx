import { useMessages } from '@features/l10n/l10nInjector.js';
import { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaUndo } from 'react-icons/fa';

type Props = {
  /** Resets the surrounding form to its defaults. */
  onClick: () => void;
  className?: string;
};

/**
 * "Reset to default" footer button shared by the settings/style modals. Neutral
 * (`secondary`) because it only refills the form — nothing is saved until the
 * user submits. `type="button"` so it never submits the surrounding form.
 */
export function ResetToDefaultsButton({
  onClick,
  className,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <Button
      variant="secondary"
      type="button"
      className={className}
      onClick={onClick}
    >
      <FaUndo /> {m?.general.resetToDefaults}
    </Button>
  );
}
