import { deleteFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { Action } from '@reduxjs/toolkit';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = {
  // The action a dedicated toolbar dispatches to delete its own feature. Omit
  // to fall back to the generic, selection-aware `deleteFeature()`.
  action?: Action;
};

export function DeleteButton({ action }: Props = {}): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.general.delete} kbd="Del">
      {({ props }) => (
        <Button
          className="ms-1"
          variant="danger"
          onClick={() => {
            dispatch(action ?? deleteFeature());
          }}
          {...props}
        >
          <FaTrash />
        </Button>
      )}
    </LongPressTooltip>
  );
}
