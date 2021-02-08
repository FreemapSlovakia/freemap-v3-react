import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Selection } from './Selection';

export function DrawingPointSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  return (
    <Selection
      icon={<FaMapMarkerAlt />}
      title={m?.selections.drawPoints}
      deletable
    >
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => dispatch(setActiveModal('edit-label'))}
      >
        <FaTag />
        <span className="d-none d-sm-inline"> {m?.drawing.modify}</span>
      </Button>
    </Selection>
  );
}
