import { type ReactElement, useEffect } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../actions/mainActions.js';
import { trackingActions } from '../../actions/trackingActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { Device } from './Device.js';

export function Devices(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.devices);

  useEffect(() => {
    dispatch(trackingActions.loadDevices());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye /> {m?.tracking.devices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="secondary">{m?.tracking.devices.desc()}</Alert>

        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{m?.tracking.device.name}</th>
              <th>{m?.tracking.device.token}</th>
              <th>{m?.tracking.device.maxCount}</th>
              <th>{m?.tracking.device.maxAge}</th>
              <th>{m?.general.createdAt}</th>
              <th>{m?.general.actions}</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <Device key={device.id} device={device} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyDevice(null));
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
