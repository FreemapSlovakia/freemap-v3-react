import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Alert, ListGroup, Modal } from 'react-bootstrap';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { TrackedDevice } from './TrackedDevice.js';

export function TrackedDevices(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const dispatch = useDispatch();

  const devices = useAppSelector((state) => state.tracking.trackedDevices);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye /> <Text m={tm} k="trackedDevices.modalTitle" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <Text m={tm} k="trackedDevices.desc" />
        </p>

        <Alert variant="warning">
          <Text m={tm} k="trackedDevices.storageWarning" />
        </Alert>

        {devices.length > 0 && (
          <ListGroup>
            {devices.map((device) => (
              <TrackedDevice key={device.token} device={device} />
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmFooterButton
          onClick={() => {
            dispatch(setActiveModal({ type: 'tracking-watched', token: '' }));
          }}
          icon={<FaPlus />}
          label={m?.general.add}
        />

        <FmDismissButton
          label={m?.general.close}
          onClick={() => {
            dispatch(setActiveModal(null));
          }}
        />
      </FmModalFooter>
    </>
  );
}
