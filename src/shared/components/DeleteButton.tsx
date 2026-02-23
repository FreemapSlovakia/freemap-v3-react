import { deleteFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function DeleteButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.general.delete} kbd="Del">
      {({ props }) => (
        <Button
          className="ms-1"
          variant="danger"
          onClick={() => {
            dispatch(deleteFeature());
          }}
          {...props}
        >
          <FaTrash />
        </Button>
      )}
    </LongPressTooltip>
  );
}
