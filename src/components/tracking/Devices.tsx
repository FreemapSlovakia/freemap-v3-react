import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, ReactElement } from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { Device } from './Device';
import { RootState } from 'fm3/storeCreator';
import { useMessages } from 'fm3/l10nInjector';

export function Devices(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const devices = useSelector((state: RootState) => state.tracking.devices);

  useEffect(() => {
    dispatch(trackingActions.loadDevices());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> {m?.tracking.devices.modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">{m?.tracking.devices.desc}</Alert>
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
