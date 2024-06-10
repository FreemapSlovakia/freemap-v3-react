import { setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { OpenInExternalAppMenuButton } from './OpenInExternalAppMenuButton';
import { Selection } from './Selection';

export default DrawingPointSelection;

export function DrawingPointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const point = useAppSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? state.drawingPoints.points[state.main.selection.id]
      : undefined,
  );

  return !point ? null : (
    <Selection
      icon={<FaMapMarkerAlt />}
      title={m?.selections.drawPoints}
      deletable
    >
      <Button
        className="ms-1"
        variant="secondary"
        onClick={() => dispatch(setActiveModal('edit-label'))}
      >
        <FaTag />
        <span className="d-none d-sm-inline"> {m?.drawing.modify}</span>
      </Button>

      <OpenInExternalAppMenuButton
        className="ms-1"
        lat={point.lat}
        lon={point.lon}
        includePoint
        pointTitle={point.label}
        url={`/?point=${point.lat}/${point.lon}`}
      >
        <FaExternalLinkAlt />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.gallery.viewer.openInNewWindow}
        </span>
      </OpenInExternalAppMenuButton>
    </Selection>
  );
}
