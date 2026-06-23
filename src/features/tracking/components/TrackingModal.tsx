import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { AccessTokenForm } from './AccessTokenForm.js';
import { AccessTokens } from './AccessTokens.js';
import { MyDeviceForm } from './MyDeviceForm.js';
import { MyDevices } from './MyDevices.js';
import { TrackedDeviceForm } from './TrackedDeviceForm.js';
import { TrackedDevices } from './TrackedDevices.js';

// type Views =
//   | 'devices'
//   | 'deviceForm'
//   | 'accessTokens'
//   | 'accessTokenForm'
//   | 'trackedDevices'
//   | 'trackedDeviceForm';

type Props = { show: boolean };

export default function TrackingModal({ show }: Props): ReactElement {
  const isMy = useAppSelector(
    (state) => state.main.activeModal?.type === 'tracking-my',
  );

  const view = useAppSelector((state) => {
    const am = state.main.activeModal;

    if (am?.type === 'tracking-my') {
      return state.tracking.modifiedDeviceId !== undefined
        ? 'deviceForm'
        : state.tracking.accessTokensDeviceId
          ? state.tracking.modifiedAccessTokenId !== undefined
            ? 'accessTokenForm'
            : 'accessTokens'
          : 'devices';
    }

    return am?.type === 'tracking-watched' && am.token !== undefined
      ? 'trackedDeviceForm'
      : 'trackedDevices';
  });

  const tm = useTrackingMessages();

  useDocumentTitle(
    !show
      ? undefined
      : isMy
        ? tm?.devices.modalTitle
        : tm?.trackedDevices.modalTitle,
  );

  const dispatch = useDispatch();

  const isList = ['devices', 'accessTokens', 'trackedDevices'].includes(view);

  return (
    <Modal
      scrollable
      onHide={() => {
        dispatch(setActiveModal(null));
      }}
      show={show}
      size={isList ? 'lg' : undefined}
      contentClassName="bg-body-tertiary"
    >
      {view === 'devices' && <MyDevices />}
      {view === 'deviceForm' && <MyDeviceForm />}
      {view === 'accessTokens' && <AccessTokens />}
      {view === 'accessTokenForm' && <AccessTokenForm />}
      {view === 'trackedDevices' && <TrackedDevices />}
      {view === 'trackedDeviceForm' && <TrackedDeviceForm />}
    </Modal>
  );
}
