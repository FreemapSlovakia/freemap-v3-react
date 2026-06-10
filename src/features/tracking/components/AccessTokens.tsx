import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Alert, Button, ListGroup, Modal } from 'react-bootstrap';
import { FaBullseye, FaChevronLeft, FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { AccessToken } from './AccessToken.js';

export function AccessTokens(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

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
          <FaBullseye /> {tm?.accessTokens.modalTitle(deviceName)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="secondary">{tm?.accessTokens.desc(deviceName)}</Alert>

        {accessTokens.length > 0 && (
          <ListGroup>
            {accessTokens.map((accessToken) => (
              <AccessToken
                key={accessToken.id}
                accessToken={accessToken}
                deviceName={deviceName}
              />
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyAccessToken(null));
          }}
        >
          <FaPlus /> {m?.general.add}
        </Button>

        <Button
          type="button"
          variant="dark"
          onClick={() => {
            dispatch(trackingActions.showAccessTokens(undefined));
          }}
        >
          <FaChevronLeft /> {m?.general.back}
        </Button>
      </Modal.Footer>
    </>
  );
}
