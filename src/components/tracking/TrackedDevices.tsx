import { useSelector, useDispatch } from 'react-redux';
import React, { ReactElement } from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { TrackedDevice } from './TrackedDevice';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function TrackedDevices(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const devices = useSelector(
    (state: RootState) => state.tracking.trackedDevices,
  );

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {t('tracking.trackedDevices.modalTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">{t('tracking.trackedDevices.desc')}</Alert>
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{t('tracking.trackedDevice.token')}</th>
              <th>{t('tracking.trackedDevice.label')}</th>
              <th>{t('tracking.trackedDevice.fromTime')}</th>
              <th>{t('tracking.trackedDevice.maxAge')}</th>
              <th>{t('tracking.trackedDevice.maxCount')}</th>
              <th>{t('tracking.trackedDevice.splitDistance')}</th>
              <th>{t('tracking.trackedDevice.splitDuration')}</th>
              <th>{t('general.actions')}</th>
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
          {t('general.add')}
        </Button>
        <Button
          type="button"
          onClick={() => {
            dispatch(setActiveModal(null));
          }}
        >
          {t('general.close')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
