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
 * Warning-styled "Reset to default" footer button shared by the settings/style
 * modals. `type="button"` so it never submits the surrounding form.
 */
export function ResetToDefaultsButton({
  onClick,
  className,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <Button
      variant="warning"
      type="button"
      className={className}
      onClick={onClick}
    >
      <FaUndo /> {m?.general.resetToDefaults}
    </Button>
  );
}
