import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Button, Kbd } from '@mantine/core';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Alert, Modal, Table } from 'react-bootstrap';
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

        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{m?.tracking.trackedDevice.token}</th>
              <th>{m?.tracking.trackedDevice.label}</th>
              <th>{m?.tracking.trackedDevice.fromTime}</th>
              <th>{m?.tracking.trackedDevice.maxAge}</th>
              <th>{m?.tracking.trackedDevice.maxCount}</th>
              <th>{m?.tracking.trackedDevice.splitDistance}</th>
              <th>{m?.tracking.trackedDevice.splitDuration}</th>
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
          size="sm"
          leftSection={<FaPlus />}
          onClick={() => {
            dispatch(trackingActions.modifyTrackedDevice(null));
          }}
        >
          {m?.general.add}
        </Button>

        <Button
          color="dark"
          size="sm"
          type="button"
          leftSection={<FaTimes />}
          rightSection={<Kbd>Esc</Kbd>}
          onClick={() => {
            dispatch(setActiveModal(null));
          }}
        >
          {m?.general.close}
        </Button>
      </Modal.Footer>
    </>
  );
}
