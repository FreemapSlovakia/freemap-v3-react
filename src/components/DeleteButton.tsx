import { deleteFeature } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function DeleteButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <Button
      className="ml-1"
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
