import { convertToDrawing } from 'fm3/actions/mainActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';
import { Selection } from './Selection';

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  return (
    <Selection icon="map-marker" title={m?.selections.objects} deletable>
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
    </Selection>
  );
}
