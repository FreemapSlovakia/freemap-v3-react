import { connect } from 'react-redux';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingSaveAccessToken, trackingModifyAccessToken } from 'fm3/actions/trackingActions';
import DateTime from 'fm3/components/DateTime';

// TODO to hook file
function useInputState(init, type = 'text') {
  const [value, setValue] = useState(init);
  return [value, e => setValue(type === 'checkbox' ? e.target.checked : e.target.value)];
}


function AccessTokenForm({ onSave, onCancel, accessToken, deviceName }) {
  const [note, setNote] = useInputState(accessToken && accessToken.note || '');
  const [timeFrom, setTimeFrom] = useState(accessToken && accessToken.timeFrom);
  const [timeTo, setTimeTo] = useState(accessToken && accessToken.timeTo);
  const [listingLabel, setListingLabel] = useInputState(accessToken && accessToken.listingLabel || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      note: note.trim() || null,
      timeFrom,
      timeTo,
      listingLabel: listingLabel.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />
          {accessToken ? <> Modify Access Token <i>{accessToken.token}</i></> : ' Add Access Token'}
          {' for'} <i>{deviceName}</i>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          <ControlLabel>Share from</ControlLabel>
          <DateTime value={timeFrom} onChange={setTimeFrom} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Share to</ControlLabel>
          <DateTime value={timeTo} onChange={setTimeTo} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Listing label (leave empty for unlisted)</ControlLabel>
          <FormControl value={listingLabel} onChange={setListingLabel} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Note</ControlLabel>
          <FormControl value={note} onChange={setNote} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">
          Save
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </form>
  );
}

AccessTokenForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  accessToken: PropTypes.shape({}).isRequired, // TODO
  deviceName: PropTypes.string,
};

export default connect(
  state => ({
    accessToken: state.tracking.modifiedAccessTokenId
      && state.tracking.accessTokens.find(accessToken => accessToken.id === state.tracking.modifiedAccessTokenId),
    deviceName: state.tracking.devices.find(device => device.id === state.tracking.accessTokensDeviceId).name,
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackingModifyAccessToken(undefined));
    },
    onSave(accessToken) {
      dispatch(trackingSaveAccessToken(accessToken));
    },
  }),
)(AccessTokenForm);
