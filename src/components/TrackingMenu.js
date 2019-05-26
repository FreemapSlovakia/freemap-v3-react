import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';

import { setActiveModal } from 'fm3/actions/mainActions';

function TrackingMenu({ onTrackedDevicesClick, onMyDevicesClick }) {
  return (
    <>
      <span className="fm-label">
        <FontAwesomeIcon icon="bullseye" />
        <span className="hidden-xs"> Device Tracking</span>
      </span>
      {' '}
      <Button onClick={onTrackedDevicesClick}>
        <FontAwesomeIcon icon="eye" />
        <span className="hidden-xs"> Tracked</span>
      </Button>
      {' '}
      <Button onClick={onMyDevicesClick}>
        <FontAwesomeIcon icon="mobile" />
        <span className="hidden-xs"> My Devices</span>
      </Button>
    </>
  );
}

TrackingMenu.propTypes = {
  onTrackedDevicesClick: PropTypes.func.isRequired,
  onMyDevicesClick: PropTypes.func.isRequired,
};

export default compose(
  connect(
    state => ({
      isActive: state.infoPoint.activeIndex !== null,
    }),
    dispatch => ({
      onMyDevicesClick() {
        dispatch(setActiveModal('tracking-my'));
      },
      onTrackedDevicesClick() {
        dispatch(setActiveModal('tracking-tracked'));
      },

    }),
  ),
)(TrackingMenu);
