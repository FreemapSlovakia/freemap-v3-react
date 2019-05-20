import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingModifyTrackedDevice } from 'fm3/actions/trackingActions';
import TrackedDevice from './TrackedDevice';

function TrackedDevices({ onClose, onAdd, devices, onShowTrackedDevices }) {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <Alert bsStyle="warning">
            <FontAwesomeIcon icon="flask" />
            <b>Warning!</b> This is experimental feature under development.
          </Alert>
          <FontAwesomeIcon icon="bullseye" /> Tracked Devices
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Token or Device</th>
              <th>Label</th>
              <th>Since</th>
              <th>Max Age</th>
              <th>Max Count</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {devices.map(device => <TrackedDevice key={device.id} device={device} />)}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onShowTrackedDevices}>
          Show my devices
        </Button>
        <Button type="button" onClick={onAdd}>
          Add
        </Button>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
}

TrackedDevices.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onShowTrackedDevices: PropTypes.func.isRequired,
  devices: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.trackedDevices,
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
    onShowTrackedDevices() {
      dispatch(setActiveModal('tracking-my'));
    },
    onAdd() {
      dispatch(trackingModifyTrackedDevice(null));
    },
  }),
)(TrackedDevices);
