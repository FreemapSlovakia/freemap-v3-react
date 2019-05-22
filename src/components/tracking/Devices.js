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
        <Alert bsStyle="info">
          <p>
            Manage your devices so that others can watch your position if you give them access token <FontAwesomeIcon icon="key" /> you create.
          </p>
          <p>
            Enter following URL to your tracker (eg. <a href="https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking">Locus</a>):
            <code>{process.env.API_URL}/tracking/track/<i>token</i></code> where <i>token</i> is listed in the table below.
          </p>
          <p>
            Endpoint supports HTTP <code>GET</code> or <code>POST</code> with URL-encoded parameters:
          </p>
          <ul>
            <li><code>lat</code> - latitude in degrees (mandatory)</li>
            <li><code>lon</code> - longitude in degrees (mandatory)</li>
            <li><code>time</code> - JavaScript parsable datetime or Unix time in s or ms</li>
            <li><code>alt</code> - altitude in meters</li>
            <li><code>speed</code> - speed in m/s</li>
            <li><code>acc</code> - accuracy in meters</li>
            <li><code>bearing</code> - bearing in degrees</li>
            <li><code>battery</code> - battery in percents</li>
            <li><code>gsm_signal</code> - GSM signal in percents</li>
            <li><code>message</code> - message (note) to be displayed</li>
          </ul>
        </Alert>

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
        <Button type="button" bsStyle="primary" onClick={onShowTrackedDevices}>
          Manage devices you watch
        </Button>
        <Button type="button" onClick={onAdd}>
          Add new
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
