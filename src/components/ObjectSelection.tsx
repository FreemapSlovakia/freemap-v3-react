import { convertToDrawing } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Selection } from './Selection';

export default ObjectSelection;

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <Selection icon={<FaMapMarkerAlt />} title={m?.selections.objects}>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          if (selection?.type === 'objects') {
            dispatch(convertToDrawing(selection));
          }
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
