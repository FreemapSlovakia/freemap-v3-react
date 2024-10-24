import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Device } from './Device';

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
