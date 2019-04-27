import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingLoadAccessTokens, trackingModifyAccessToken, trackingShowAccessTokens } from 'fm3/actions/trackingActions';
import AccessToken from './AccessToken';

function AccessTokens({ onClose, onOpen, onAdd, accessTokens }) {
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> Tracking Devices | Access Tokens
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Token</th>
              <th>Created at</th>
              <th>From</th>
              <th>To</th>
              <th>Access</th>
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
          Add
        </Button>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
}

AccessTokens.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  accessTokens: PropTypes.arrayOf(PropTypes.shape({}).isRequired).isRequired,
};

export default connect(
  state => ({
    accessTokens: state.tracking.accessTokens,
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
