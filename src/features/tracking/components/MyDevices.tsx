import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect } from 'react';
import { Alert, Button, ListGroup, Modal } from 'react-bootstrap';
import { FaMobileAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { MyDevice } from './MyDevice.js';

export function MyDevices(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.devices);

  useEffect(() => {
    dispatch(trackingActions.loadDevices());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMobileAlt /> {tm?.devices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="secondary">{tm?.devices.desc()}</Alert>

        {devices.length > 0 && (
          <ListGroup>
            {devices.map((device) => (
              <MyDevice key={device.id} device={device} />
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={() => dispatch(trackingActions.modifyDevice(null))}>
          <FaPlus /> {m?.general.add}
        </Button>

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
