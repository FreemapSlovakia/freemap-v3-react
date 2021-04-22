import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { OpenInExternalAppMenuButton } from './OpenInExternalAppMenuButton';
import { Selection } from './Selection';

export function DrawingPointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const point = useSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? state.drawingPoints.points[state.main.selection.id]
      : undefined,
  );

  if (!point) {
    return null;
  }

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

      <OpenInExternalAppMenuButton
        className="ml-1"
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
