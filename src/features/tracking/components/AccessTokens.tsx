import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/hook.js';
import { AccessToken } from './AccessToken.js';

export function AccessTokens(): ReactElement {
  const m = useMessages();

  const lm = useTrackingMessages();

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
          <FaBullseye /> {lm?.accessTokens.modalTitle(deviceName)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="secondary">{lm?.accessTokens.desc(deviceName)}</Alert>
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{lm?.accessToken.token}</th>
              <th>{m?.general.createdAt}</th>
              <th>{lm?.accessToken.timeFrom}</th>
              <th>{lm?.accessToken.timeTo}</th>
              {/* <th>{lm?.accessToken.listingLabel}</th> */}
              <th>{lm?.accessToken.note}</th>
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
