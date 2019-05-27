import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  trackingSetShowPoints,
  trackingSetShowLine,
} from 'fm3/actions/trackingActions';

function TrackingMenu({
  onTrackedDevicesClick,
  onMyDevicesClick,
  onVisualChange,
  visual,
}) {
  const handleVisualSelect = useCallback(
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
        <span className="hidden-xs"> Tracked</span>
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
}

TrackingMenu.propTypes = {
  onTrackedDevicesClick: PropTypes.func.isRequired,
  onMyDevicesClick: PropTypes.func.isRequired,
  onVisualChange: PropTypes.func.isRequired,
  visual: PropTypes.string.isRequired,
};

export default compose(
  connect(
    state => ({
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
            dispatch(trackingSetShowPoints(false));
            dispatch(trackingSetShowLine(true));
            break;
          case 'points':
            dispatch(trackingSetShowPoints(true));
            dispatch(trackingSetShowLine(false));
            break;
          case 'line+points':
            dispatch(trackingSetShowPoints(true));
            dispatch(trackingSetShowLine(true));
            break;
          default:
            break;
        }
      },
    }),
  ),
)(TrackingMenu);
