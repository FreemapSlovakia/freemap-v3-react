import { deleteFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import type { ReactElement } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function DeleteButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <MantineLongPressTooltip label={m?.general.delete} kbd="Del">
      {({ props }) => (
        <Button
          className="ms-1"
          color="red"
          size="sm"
          onClick={() => {
            dispatch(deleteFeature());
          }}
          {...props}
        >
          <FaTrash />
        </Button>
      )}
    </MantineLongPressTooltip>
  );
}
