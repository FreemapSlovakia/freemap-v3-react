import { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { OpenInExternalAppMenuButton } from './OpenInExternalAppMenuButton.js';
import { Selection } from './Selection.js';

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
