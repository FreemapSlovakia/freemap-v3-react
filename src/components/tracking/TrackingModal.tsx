import { ReactElement } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../../actions/mainActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { AccessTokenForm } from './AccessTokenForm.js';
import { AccessTokens } from './AccessTokens.js';
import { DeviceForm } from './DeviceForm.js';
import { Devices } from './Devices.js';
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

export default TrackingModal;

export function TrackingModal({ show }: Props): ReactElement {
  const view = useAppSelector((state) =>
    state.main.activeModal === 'tracking-my'
      ? state.tracking.modifiedDeviceId !== undefined
        ? 'deviceForm'
        : state.tracking.accessTokensDeviceId
          ? state.tracking.modifiedAccessTokenId !== undefined
            ? 'accessTokenForm'
            : 'accessTokens'
          : 'devices'
      : state.tracking.modifiedTrackedDeviceId !== undefined
        ? 'trackedDeviceForm'
        : 'trackedDevices',
  );

  const dispatch = useDispatch();

  return (
    <Modal
      onHide={() => {
        dispatch(setActiveModal(null));
      }}
      show={show}
      className="dynamic"
    >
      {view === 'devices' && <Devices />}
      {view === 'deviceForm' && <DeviceForm />}
      {view === 'accessTokens' && <AccessTokens />}
      {view === 'accessTokenForm' && <AccessTokenForm />}
      {view === 'trackedDevices' && <TrackedDevices />}
      {view === 'trackedDeviceForm' && <TrackedDeviceForm />}
    </Modal>
  );
}
