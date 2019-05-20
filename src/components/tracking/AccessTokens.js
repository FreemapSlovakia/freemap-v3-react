import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingLoadAccessTokens, trackingModifyAccessToken, trackingShowAccessTokens } from 'fm3/actions/trackingActions';
import AccessToken from './AccessToken';

function AccessTokens({ onClose, onOpen, onAdd, accessTokens, deviceName }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> Access Tokens for <i>{deviceName}</i>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">
          <p>
            Define access tokens to share position of your device <i>{deviceName}</i> with your friends.
          </p>
        </Alert>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Token</th>
              <th>Created at</th>
              <th>From</th>
              <th>To</th>
              <th>Listing label</th>
              <th>Note</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {accessTokens.map(accessToken => <AccessToken key={accessToken.id} accessToken={accessToken} />)}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onAdd}>
          Add new
        </Button>
        <Button type="button" onClick={onClose}>
          Back to the list
        </Button>
      </Modal.Footer>
    </>
  );
}

AccessTokens.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  deviceName: PropTypes.string,
  accessTokens: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
};

export default connect(
  state => ({
    accessTokens: state.tracking.accessTokens,
    deviceName: state.tracking.devices.find(device => device.id === state.tracking.accessTokensDeviceId).name,
  }),
  dispatch => ({
    onOpen() {
      dispatch(trackingLoadAccessTokens());
    },
    onClose() {
      dispatch(trackingShowAccessTokens(undefined));
    },
    onAdd() {
      dispatch(trackingModifyAccessToken(null));
    },
  }),
)(AccessTokens);
