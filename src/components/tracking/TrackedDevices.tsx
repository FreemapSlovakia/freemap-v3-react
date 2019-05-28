import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import TrackedDevice from './TrackedDevice';
import { ITrackedDevice } from 'fm3/types/trackingTypes';

interface Props {
  onClose: () => void;
  onAdd: () => void;
  devices: ITrackedDevice[];
}

const TrackedDevices: React.FC<Props> = ({ onClose, onAdd, devices }) => {
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <Alert bsStyle="warning">
            <FontAwesomeIcon icon="flask" />
            <b>Warning!</b> This is experimental feature under development.
          </Alert>
          <FontAwesomeIcon icon="bullseye" /> Devices you watch
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">
          <p>Manage watched devices to see the position of your friends.</p>
        </Alert>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Watch Token</th>
              <th>Label</th>
              <th>Since</th>
              <th>Max Age</th>
              <th>Max Count</th>
              <th>Split Dist.</th>
              <th>Split Dur.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <TrackedDevice key={device.id} device={device} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onAdd}>
          Add new
        </Button>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
};

export default connect(
  (state: any) => ({
    devices: state.tracking.trackedDevices,
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
    onAdd() {
      dispatch(trackingActions.modifyTrackedDevice(null));
    },
  }),
)(TrackedDevices);
