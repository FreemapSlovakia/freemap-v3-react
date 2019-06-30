import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import Device from './Device';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const Devices: React.FC<Props> = ({ onClose, onOpen, onAdd, devices, t }) => {
  React.useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" /> {t('tracking.devices.modalTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">{t('tracking.devices.desc')}</Alert>
        <Table striped bordered>
          <thead>
            <tr>
              <th>{t('tracking.device.name')}</th>
              <th>{t('tracking.device.token')}</th>
              <th>{t('tracking.device.maxCount')}</th>
              <th>{t('tracking.device.maxAge')}</th>
              <th>{t('general.createdAt')}</th>
              <th>{t('general.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <Device key={device.id} device={device} />
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
};

const mapStateToProps = (state: RootState) => ({
  devices: state.tracking.devices,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onOpen() {
    dispatch(trackingActions.loadDevices());
  },
  onClose() {
    dispatch(setActiveModal(null));
  },
  onAdd() {
    dispatch(trackingActions.modifyDevice(null));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Devices);
