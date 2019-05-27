import { connect } from 'react-redux';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import {
  trackingSaveDevice,
  trackingModifyDevice,
} from 'fm3/actions/trackingActions';

// TODO to hook file
function useInputState(init, type = 'text') {
  const [value, setValue] = useState(init);
  return [
    value,
    e => setValue(type === 'checkbox' ? e.target.checked : e.target.value),
  ];
}

function DeviceForm({ onSave, onCancel, device }) {
  const [name, setName] = useInputState((device && device.name) || '');
  const [maxCount, setMaxCount] = useInputState(
    device && device.maxCount !== null ? device.maxCount.toString() : '',
  );
  const [maxAge, setMaxAge] = useInputState(
    device && device.maxAge !== null ? device.maxAge.toString() : '',
  );
  const [regenerateToken, setRegenerateToken] = useInputState(
    false,
    'checkbox',
  );

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      name: name.trim() || null,
      maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
      maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10),
      regenerateToken,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />
          {device ? (
            <>
              {' '}
              Modify Tracking Device <i>{device.name}</i>
            </>
          ) : (
            ' Add Tracking Device'
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            value={name}
            onChange={setName}
            required
            pattern=".*\w.*"
            maxLength={255}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Keep # of last positions</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxCount}
            onChange={setMaxCount}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Keep positions not older than (seconds)</ControlLabel>
          <FormControl
            type="number"
            min="0"
            step="1"
            value={maxAge}
            onChange={setMaxAge}
          />
        </FormGroup>
        {!!device && (
          <Checkbox onChange={setRegenerateToken} checked={regenerateToken}>
            Regenerate token
          </Checkbox>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">Save</Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </form>
  );
}

DeviceForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  device: PropTypes.shape({}), // TODO
};

export default connect(
  state => ({
    device:
      state.tracking.modifiedDeviceId &&
      state.tracking.devices.find(
        device => device.id === state.tracking.modifiedDeviceId,
      ),
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackingModifyDevice(undefined));
    },
    onSave(device) {
      dispatch(trackingSaveDevice(device));
    },
  }),
)(DeviceForm);
