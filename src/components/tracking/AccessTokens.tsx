import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import AccessToken from './AccessToken';
import { IAccessToken } from 'fm3/types/trackingTypes';

interface Props {
  onOpen: () => void;
  onClose: () => void;
  onAdd: () => void;
  deviceName: string;
  accessTokens: IAccessToken[];
}

const AccessTokens: React.FC<Props> = ({
  onClose,
  onOpen,
  onAdd,
  accessTokens,
  deviceName,
}) => {
  React.useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> Watch Tokens for{' '}
          <i>{deviceName}</i>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">
          <p>
            Define access tokens to share position of your device{' '}
            <i>{deviceName}</i> with your friends.
          </p>
        </Alert>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Watch Token</th>
              <th>Created at</th>
              <th>From</th>
              <th>To</th>
              <th>Listing label</th>
              <th>Note</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {accessTokens.map(accessToken => (
              <AccessToken key={accessToken.id} accessToken={accessToken} />
            ))}
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
};

export default connect(
  (state: any) => ({
    accessTokens: state.tracking.accessTokens,
    deviceName: state.tracking.devices.find(
      device => device.id === state.tracking.accessTokensDeviceId,
    ).name,
  }),
  dispatch => ({
    onOpen() {
      dispatch(trackingActions.loadAccessTokens());
    },
    onClose() {
      dispatch(trackingActions.showAccessTokens(undefined));
    },
    onAdd() {
      dispatch(trackingActions.modifyAccessToken(null));
    },
  }),
)(AccessTokens);
