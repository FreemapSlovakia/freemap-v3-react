import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { convertToDrawing } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';

export default ObjectSelection;

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <Selection icon={<FaMapMarkerAlt />} title={m?.selections.objects}>
      <Button
        className="ms-1"
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
