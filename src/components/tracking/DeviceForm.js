import { compose } from 'redux';
import { connect } from 'react-redux';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingSaveDevice } from 'fm3/actions/trackingActions';

function useInputState(init) {
  const [value, setValue] = useState(init);
  return [value, e => setValue(e.target.value)];
}

function TrackingModal({ onSave, onClose, onCancel }) {
  const [name, setName] = useInputState('');
  const [maxCount, setMaxCount] = useInputState('');
  const [maxAge, setMaxAge] = useInputState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      maxCount: maxCount === '' ? null : Number.parseInt(maxCount, 10),
      maxAge: maxAge === '' ? null : Number.parseInt(maxAge, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Body>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl value={name} onChange={setName} required pattern=".*\w.*" />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Keep # of last positions</ControlLabel>
          <FormControl type="number" min="0" step="1" value={maxCount} onChange={setMaxCount} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Keep positions not older than (seconds)</ControlLabel>
          <FormControl type="number" min="0" step="1" value={maxAge} onChange={setMaxAge} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">
          Save
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </form>
  );
}

TrackingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default connect(
  state => ({
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
    onCancel() {
      dispatch(setActiveModal('tracking'));
    },
    onSave(device) {
      dispatch(trackingSaveDevice(device));
    },
  }),
)(TrackingModal);
