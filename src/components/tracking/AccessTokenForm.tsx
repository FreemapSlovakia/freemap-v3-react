import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import DateTime from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';
import { IAccessToken, IAccessTokenBase } from 'fm3/types/trackingTypes';
import { useTextInputState } from 'fm3/hooks/inputHooks';

interface Props {
  onCancel: () => void;
  onSave: (at: IAccessTokenBase) => void;
  accessToken: IAccessToken;
  deviceName: string;
}

const AccessTokenForm: React.FC<Props> = ({
  onSave,
  onCancel,
  accessToken,
  deviceName,
}) => {
  const [note, setNote] = useTextInputState(
    (accessToken && accessToken.note) || '',
  );
  const [timeFrom, setTimeFrom] = React.useState(
    accessToken && accessToken.timeFrom
      ? toDatetimeLocal(accessToken.timeFrom)
      : '',
  );
  const [timeTo, setTimeTo] = React.useState(
    accessToken && accessToken.timeTo
      ? toDatetimeLocal(accessToken.timeTo)
      : '',
  );
  const [listingLabel, setListingLabel] = useTextInputState(
    (accessToken && accessToken.listingLabel) || '',
  );

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      note: note.trim() || null,
      timeFrom: timeFrom === '' ? null : new Date(timeFrom),
      timeTo: timeTo === '' ? null : new Date(timeTo),
      listingLabel: listingLabel.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />
          {accessToken ? (
            <>
              {' Modify Watch Token '}
              <i>{accessToken.token}</i>
            </>
          ) : (
            ' Add Watch Token'
          )}
          {' for '}
          <i>{deviceName}</i>
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
          <FormControl
            value={listingLabel}
            onChange={setListingLabel}
            maxLength={255}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Note</ControlLabel>
          <FormControl value={note} onChange={setNote} maxLength={255} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">Save</Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </form>
  );
};

export default connect(
  (state: any) => ({
    accessToken:
      state.tracking.modifiedAccessTokenId &&
      state.tracking.accessTokens.find(
        accessToken => accessToken.id === state.tracking.modifiedAccessTokenId,
      ),
    deviceName: state.tracking.devices.find(
      device => device.id === state.tracking.accessTokensDeviceId,
    ).name,
  }),
  dispatch => ({
    onCancel() {
      dispatch(trackingActions.modifyAccessToken(undefined));
    },
    onSave(accessToken) {
      dispatch(trackingActions.saveAccessToken(accessToken));
    },
  }),
)(AccessTokenForm);
