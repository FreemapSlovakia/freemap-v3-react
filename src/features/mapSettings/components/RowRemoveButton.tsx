import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

/**
 * A Map layers panel row's Remove. It reaches into the row's padding by its
 * own, so its icon keeps the distance from the edge the row's first one has.
 */
export function RowRemoveButton({
  onClick,
}: {
  onClick: () => void;
}): ReactElement {
  const m = useMessages();

  return (
    <LongPressTooltip label={m?.general.remove}>
      {({ props }) => (
        <Button
          variant="link"
          size="sm"
          className="flex-shrink-0 text-body px-1 me-n1"
          onClick={onClick}
          {...props}
        >
          <FaTrash />
        </Button>
      )}
    </LongPressTooltip>
  );
}
