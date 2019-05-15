import { connect } from 'react-redux';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import DateTime from 'fm3/components/DateTime';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingModifyTrackedDevice, trackingSaveTrackedDevice } from 'fm3/actions/trackingActions';

// TODO to hook file
function useInputState(init, type = 'text') {
  const [value, setValue] = useState(init);
  return [value, e => setValue(type === 'checkbox' ? e.target.checked : e.target.value)];
}

function TrackedDeviceForm({ onSave, onCancel, device }) {
  const [id, setId] = useInputState(device && device.id || '');
  const [label, setLabel] = useInputState(device && device.label || '');
  const [fromTime, setFromTime] = useState(device && device.fromTime);
  const [maxCount, setMaxCount] = useInputState(device && device.maxCount !== null ? device.maxCount.toString() : '');
  const [maxAge, setMaxAge] = useInputState(device && device.maxAge !== null ? device.maxAge.toString() : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: id.trim(),
      label: label.trim() || null,
      fromTime,
      maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10),
      maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />
          {device ? <> Modify Tracked Device <i>{device.label || device.id}</i></> : ' Add Tracked Device'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          <ControlLabel>ID or Access Token</ControlLabel>
          <FormControl value={id} onChange={setId} required />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Label</ControlLabel>
          <FormControl value={label} onChange={setLabel} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show positions since</ControlLabel>
          <DateTime value={fromTime} onChange={setFromTime} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show positions not older than (seconds)</ControlLabel>
          <FormControl type="number" min="0" step="1" value={maxAge} onChange={setMaxAge} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Show max # positions</ControlLabel>
          <FormControl type="number" min="0" step="1" value={maxCount} onChange={setMaxCount} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">
          OK
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </form>
  );
}

TrackedDeviceForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  device: PropTypes.shape({}), // TODO
};

export default connect(
  state => ({
    device: state.tracking.modifiedTrackedDeviceId
      && state.tracking.trackedDevices.find(device => device.id === state.tracking.modifiedTrackedDeviceId),
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackingModifyTrackedDevice(undefined));
    },
    onSave(device) {
      dispatch(trackingSaveTrackedDevice(device));
    },
  }),
)(TrackedDeviceForm);
