import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { TrackedDevice } from './TrackedDevice';

export function TrackedDevices(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const devices = useSelector(
    (state: RootState) => state.tracking.trackedDevices,
  );

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye /> {m?.tracking.trackedDevices.modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{m?.tracking.trackedDevices.desc}</p>
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
              <TrackedDevice key={device.id} device={device} />
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
