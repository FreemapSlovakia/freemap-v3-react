import { convertToDrawing } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Selection } from './Selection';

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useSelector((state) => state.main.selection);

  return (
    <Selection
      icon={<FaMapMarkerAlt />}
      title={m?.selections.objects}
      deletable
    >
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          selection?.type === 'objects' &&
            dispatch(convertToDrawing(selection));
        }}
        title={m?.general.convertToDrawing}
      >
        <FaPencilAlt />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.general.convertToDrawing}
        </span>
      </Button>
    </Selection>
  );
}
