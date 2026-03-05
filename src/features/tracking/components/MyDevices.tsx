import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/hook.js';
import { MyDevice } from './MyDevice.js';

export function MyDevices(): ReactElement {
  const m = useMessages();

  const lm = useTrackingMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.devices);

  useEffect(() => {
    dispatch(trackingActions.loadDevices());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye /> {lm?.devices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="secondary">{lm?.devices.desc()}</Alert>

        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{lm?.device.name}</th>
              <th>{lm?.device.token}</th>
              <th>{lm?.device.maxCount}</th>
              <th>{lm?.device.maxAge}</th>
              <th>{m?.general.createdAt}</th>
              <th>{m?.general.actions}</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <MyDevice key={device.id} device={device} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          onClick={() => dispatch(trackingActions.modifyDevice(null))}
        >
          {m?.general.add}
        </Button>

        <Button
          variant="dark"
          type="button"
          onClick={() => dispatch(setActiveModal(null))}
        >
          {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
