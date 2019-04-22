import { compose } from 'redux';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingLoadDevices } from 'fm3/actions/trackingActions';
import Devices from './Devices';
import DeviceForm from './DeviceForm';

function TrackingModal({ onClose, view }) {
  return (
    <Modal onHide={onClose} show bsSize="large">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> Tracking
        </Modal.Title>
      </Modal.Header>
      {view === 'tracking' && <Devices />}
      {view === 'tracking-add' && <DeviceForm />}
    </Modal>
  );
}

TrackingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['tracking', 'tracking-add']).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
    view: state.main.activeModal,
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(TrackingModal);
