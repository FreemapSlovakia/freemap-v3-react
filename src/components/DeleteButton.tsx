import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { deleteFeature } from '../actions/mainActions.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';

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
