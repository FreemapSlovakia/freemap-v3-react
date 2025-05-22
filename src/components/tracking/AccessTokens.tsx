import { type ReactElement, useEffect } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../../actions/trackingActions.js';
import { AccessToken } from '../../components/tracking/AccessToken.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';

export function AccessTokens(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const accessTokens = useAppSelector((state) => state.tracking.accessTokens);

  const deviceName = useAppSelector(
    (state) =>
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
          <FaBullseye /> {m?.tracking.accessTokens.modalTitle(deviceName)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="secondary">
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
          variant="dark"
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
