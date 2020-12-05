import { useDispatch, useSelector } from 'react-redux';
import React, { ReactElement, useEffect } from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken } from 'fm3/components/tracking/AccessToken';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function AccessTokens(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const accessTokens = useSelector(
    (state: RootState) => state.tracking.accessTokens,
  );

  const deviceName = useSelector(
    (state: RootState) =>
      (
        state.tracking.devices.find(
          (device) => device.id === state.tracking.accessTokensDeviceId,
        ) || { name: '???' }
      ).name,
  );

  useEffect(() => {
    dispatch(trackingActions.loadAccessTokens());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {m?.tracking.accessTokens.modalTitle(deviceName)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">
          {m?.tracking.accessTokens.desc(deviceName)}
        </Alert>
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{m?.tracking.accessToken.token}</th>
              <th>{m?.general.createdAt}</th>
              <th>{m?.tracking.accessToken.timeFrom}</th>
              <th>{m?.tracking.accessToken.timeTo}</th>
              {/* <th>{m?.tracking.accessToken.listingLabel}</th> */}
              <th>{m?.tracking.accessToken.note}</th>
              <th>{m?.general.actions}</th>
            </tr>
          </thead>
          <tbody>
            {accessTokens.map((accessToken) => (
              <AccessToken key={accessToken.id} accessToken={accessToken} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyAccessToken(null));
          }}
        >
          {m?.general.add}
        </Button>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.showAccessTokens(undefined));
          }}
        >
          {m?.general.back}
        </Button>
      </Modal.Footer>
    </>
  );
}
