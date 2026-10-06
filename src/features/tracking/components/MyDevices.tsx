import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, useEffect } from 'react';
import { Alert, ListGroup, Modal } from 'react-bootstrap';
import { FaMobileAlt, FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { MyDevice } from './MyDevice.js';

export function MyDevices(): ReactElement {
  const m = useMessages();

  const online = useOnline();

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.devices);

  useEffect(() => {
    dispatch(trackingActions.loadDevices());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMobileAlt /> {tm?.devices.modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        <Alert variant="secondary">{tm?.devices.desc()}</Alert>

        {devices.length > 0 && (
          <ListGroup>
            {devices.map((device) => (
              <MyDevice key={device.id} device={device} />
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmFooterButton
          disabled={!online}
          onClick={() => dispatch(trackingActions.modifyDevice(null))}
          icon={<FaPlus />}
          label={m?.general.add}
        />

        <FmDismissButton
          label={m?.general.close}
          onClick={() => dispatch(setActiveModal(null))}
        />
      </FmModalFooter>
    </>
  );
}
