import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingLoadDevices, trackingModifyDevice } from 'fm3/actions/trackingActions';
import Device from './Device';

function Devices({ onClose, onOpen, onAdd, devices, onShowTrackedDevices }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <Alert bsStyle="warning">
            <FontAwesomeIcon icon="flask" />
            <b>Warning!</b> This is experimental feature under development.
          </Alert>
          <FontAwesomeIcon icon="bullseye" /> My Tracking Devices
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Name</th>
              <th>Token</th>
              <th>Keep points</th>
              <th>Keep duration</th>
              <th>Created at</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {devices.map(device => <Device key={device.id} device={device} />)}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onShowTrackedDevices}>
          Show tracked devices
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

Devices.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onShowTrackedDevices: PropTypes.func.isRequired,
  devices: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
  }),
  dispatch => ({
    onOpen() {
      dispatch(trackingLoadDevices());
    },
    onClose() {
      dispatch(setActiveModal(null));
    },
    onShowTrackedDevices() {
      dispatch(setActiveModal('tracking-tracked'));
    },
    onAdd() {
      dispatch(trackingModifyDevice(null));
    },
  }),
)(Devices);
