import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/hook.js';
import { TrackedDevice } from './TrackedDevice.js';

export function TrackedDevices(): ReactElement {
  const m = useMessages();

  const lm = useTrackingMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.trackedDevices);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye /> {lm?.trackedDevices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{lm?.trackedDevices.desc}</p>

        <Alert variant="warning">{lm?.trackedDevices.storageWarning}</Alert>

        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{lm?.trackedDevice.token}</th>
              <th>{lm?.trackedDevice.label}</th>
              <th>{lm?.trackedDevice.fromTime}</th>
              <th>{lm?.trackedDevice.maxAge}</th>
              <th>{lm?.trackedDevice.maxCount}</th>
              <th>{lm?.trackedDevice.splitDistance}</th>
              <th>{lm?.trackedDevice.splitDuration}</th>
              <th>{m?.general.actions}</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <TrackedDevice key={device.token} device={device} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyTrackedDevice(null));
          }}
        >
          {m?.general.add}
        </Button>

        <Button
          variant="dark"
          type="button"
          onClick={() => {
            dispatch(setActiveModal(null));
          }}
        >
          {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
