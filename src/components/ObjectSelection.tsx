import { convertToDrawing } from 'fm3/actions/mainActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';
import { DeleteButton } from './DeleteButton';

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  return (
    <>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(convertToDrawing(undefined));
        }}
        title={m?.general.convertToDrawing}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.general.convertToDrawing}
        </span>
      </Button>
      <DeleteButton />
    </>
  );
}
