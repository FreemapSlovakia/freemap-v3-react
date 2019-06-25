import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import TrackedDevice from './TrackedDevice';
import { ITrackedDevice } from 'fm3/types/trackingTypes';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

interface Props {
  onClose: () => void;
  onAdd: () => void;
  devices: ITrackedDevice[];
  t: Translator;
}

const TrackedDevices: React.FC<Props> = ({ onClose, onAdd, devices, t }) => (
  <>
    <Modal.Header closeButton>
      <Modal.Title>
        <FontAwesomeIcon icon="bullseye" />{' '}
        {t('tracking.trackedDevices.modalTitle')}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Alert bsStyle="info">{t('tracking.trackedDevices.desc')}</Alert>
      <Table striped bordered>
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
          {devices.map(device => (
            <TrackedDevice key={device.id} device={device} />
          ))}
        </tbody>
      </Table>
    </Modal.Body>
    <Modal.Footer>
      <Button type="button" onClick={onAdd}>
        {t('general.add')}
      </Button>
      <Button type="button" onClick={onClose}>
        {t('general.close')}
      </Button>
    </Modal.Footer>
  </>
);

export default compose(
  injectL10n(),
  connect(
    (state: RootState) => ({
      devices: state.tracking.trackedDevices,
    }),
    (dispatch: Dispatch<RootAction>) => ({
      onClose() {
        dispatch(setActiveModal(null));
      },
      onAdd() {
        dispatch(trackingActions.modifyTrackedDevice(null));
      },
    }),
  ),
)(TrackedDevices);
