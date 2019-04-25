import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';

import { setActiveModal } from 'fm3/actions/mainActions';
import Devices from './Devices';
import DeviceForm from './DeviceForm';

function TrackingModal({ onClose, view }) {
  return (
    <Modal onHide={onClose} show bsSize="large">
      {view === 'tracking' && <Devices />}
      {view === 'tracking-form' && <DeviceForm />}
    </Modal>
  );
}

TrackingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['tracking', 'tracking-form']).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
    view: state.tracking.modifiedDeviceId === undefined ? 'tracking' : 'tracking-form',
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(TrackingModal);
