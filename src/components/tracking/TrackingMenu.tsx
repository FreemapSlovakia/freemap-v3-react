import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';

interface Props {
  onTrackedDevicesClick: () => void;
  onMyDevicesClick: () => void;
  onVisualChange: (visual: 'line+points' | 'line' | 'points') => void;
  visual: string;
}

const TrackingMenu: React.FC<Props> = ({
  onTrackedDevicesClick,
  onMyDevicesClick,
  onVisualChange,
  visual,
}) => {
  const handleVisualSelect = React.useCallback(
    ({ target: { dataset } }) => {
      onVisualChange(dataset.visual);
    },
    [onVisualChange],
  );

  return (
    <>
      <span className="fm-label">
        <FontAwesomeIcon icon="bullseye" />
        <span className="hidden-xs"> Device Tracking</span>
      </span>{' '}
      <Button onClick={onTrackedDevicesClick}>
        <FontAwesomeIcon icon="eye" />
        <span className="hidden-xs"> Watched</span>
      </Button>{' '}
      <Button onClick={onMyDevicesClick}>
        <FontAwesomeIcon icon="mobile" />
        <span className="hidden-xs"> My Devices</span>
      </Button>{' '}
      <DropdownButton
        id="tracking-visual-dropdown"
        title={
          { 'line+points': 'Line + Points', line: 'Line', points: 'Points' }[
            visual
          ] || '???'
        }
      >
        <MenuItem data-visual="points" onClick={handleVisualSelect}>
          Points
        </MenuItem>
        <MenuItem data-visual="line" onClick={handleVisualSelect}>
          Line
        </MenuItem>
        <MenuItem data-visual="line+points" onClick={handleVisualSelect}>
          Line + Points
        </MenuItem>
      </DropdownButton>
    </>
  );
};

export default compose(
  connect(
    (state: any) => ({
      isActive: state.infoPoint.activeIndex !== null,
      visual:
        state.tracking.showLine && state.tracking.showPoints
          ? 'line+points'
          : state.tracking.showLine
          ? 'line'
          : state.tracking.showPoints
          ? 'points'
          : '???',
    }),
    dispatch => ({
      onMyDevicesClick() {
        dispatch(setActiveModal('tracking-my'));
      },
      onTrackedDevicesClick() {
        dispatch(setActiveModal('tracking-tracked'));
      },
      onVisualChange(visual) {
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
    }),
  ),
)(TrackingMenu);
