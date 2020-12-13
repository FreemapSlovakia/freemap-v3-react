import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '../FontAwesomeIcon';

export function TrackingMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const visual = useSelector((state: RootState) =>
    state.tracking.showLine && state.tracking.showPoints
      ? 'line+points'
      : state.tracking.showLine
      ? 'line'
      : state.tracking.showPoints
      ? 'points'
      : undefined,
  );

  const handleVisualChange = useCallback(
    (visual: string | null) => {
      switch (visual) {
        case 'line':
          dispatch(trackingActions.setShowPoints(false));
          dispatch(trackingActions.setShowLine(true));
          break;
        case 'points':
          dispatch(trackingActions.setShowPoints(true));
          dispatch(trackingActions.setShowLine(false));
          break;
        case 'line+points':
          dispatch(trackingActions.setShowPoints(true));
          dispatch(trackingActions.setShowLine(true));
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          dispatch(setActiveModal('tracking-watched'));
        }}
      >
        <FontAwesomeIcon icon="eye" />
        <span className="d-none d-md-inline">
          {' '}
          {m?.tracking.trackedDevices.button}
        </span>
      </Button>
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => {
          dispatch(setActiveModal('tracking-my'));
        }}
      >
        <FontAwesomeIcon icon="mobile" />
        <span className="d-none d-md-inline">
          {' '}
          {m?.tracking.devices.button}
        </span>
      </Button>
      <DropdownButton
        rootCloseEvent="mousedown"
        className="ml-1"
        variant="secondary"
        id="tracking-visual-dropdown"
        title={visual && m?.tracking.visual[visual]}
      >
        <Dropdown.Item eventKey="points" onSelect={handleVisualChange}>
          {m?.tracking.visual.points}
        </Dropdown.Item>
        <Dropdown.Item eventKey="line" onSelect={handleVisualChange}>
          {m?.tracking.visual.line}
        </Dropdown.Item>
        <Dropdown.Item eventKey="line+points" onSelect={handleVisualChange}>
          {m?.tracking.visual['line+points']}
        </Dropdown.Item>
      </DropdownButton>
    </>
  );
}
