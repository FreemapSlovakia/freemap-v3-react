import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken } from 'fm3/components/tracking/AccessToken';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

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
