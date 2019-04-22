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

function TrackingModal({ onClose, onOpen, onAdd, devices, language }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
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
            {devices.map(device => (
              <tr>
                <td>{device.name}</td>
                <td>{device.token}</td>
                <td>{device.maxCount}</td>
                <td>{device.maxAge}</td>
                <td>{dateFormat.format(device.createdAt)}</td>
                <td>
                  <Button>
                    <FontAwesomeIcon icon="close" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
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

TrackingModal.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  devices: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
    language: state.l10n.language,
  }),
  dispatch => ({
    onOpen() {
      dispatch(trackingLoadDevices());
    },
    onClose() {
      dispatch(setActiveModal(null));
    },
    onAdd() {
      dispatch(setActiveModal('tracking-add'));
    },
  }),
)(TrackingModal);
