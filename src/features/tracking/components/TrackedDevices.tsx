import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Alert, Button, ListGroup, Modal } from 'react-bootstrap';
import { FaEye, FaPlus, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { TrackedDevice } from './TrackedDevice.js';

export function TrackedDevices(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.trackedDevices);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye /> {m?.tracking.trackedDevices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{m?.tracking.trackedDevices.desc}</p>

        <Alert variant="warning">
          {m?.tracking.trackedDevices.storageWarning}
        </Alert>

        {devices.length > 0 && (
          <ListGroup>
            {devices.map((device) => (
              <TrackedDevice key={device.token} device={device} />
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyTrackedDevice(null));
          }}
        >
          <FaPlus /> {m?.general.add}
        </Button>

        <Button
          variant="dark"
          type="button"
          onClick={() => {
            dispatch(setActiveModal(null));
          }}
        >
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
