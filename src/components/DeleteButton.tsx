import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { deleteFeature } from '../actions/mainActions.js';
import { useMessages } from '../l10nInjector.js';
import { Breakpoint, LongPressTooltip } from './LongPressTooltip.js';

type Props = {
  breakpoint?: Breakpoint;
};

export function DeleteButton({ breakpoint = 'lg' }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip
      label={m?.general.delete}
      breakpoint={breakpoint}
      kbd="Del"
    >
      {({ label, labelClassName, props }) => (
        <Button
          className="ms-1"
          variant="danger"
          onClick={() => {
            dispatch(deleteFeature());
          }}
          {...props}
        >
          <FaTrash />
          <span className={labelClassName}> {label}</span>
        </Button>
      )}
    </LongPressTooltip>
  );
}
