import { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { deleteFeature } from '../actions/mainActions.js';
import { useMessages } from '../l10nInjector.js';

export function DeleteButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <Button
      className="ms-1"
      variant="danger"
      title={m?.general.delete}
      onClick={() => {
        dispatch(deleteFeature());
      }}
    >
      <FaTrash />
      <span className="d-none d-sm-inline">
        {' '}
        {m?.general.delete} <kbd>Del</kbd>
      </span>
    </Button>
  );
}
