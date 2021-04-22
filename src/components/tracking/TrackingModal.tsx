import { setActiveModal } from 'fm3/actions/mainActions';
import { ReactElement } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { AccessTokenForm } from './AccessTokenForm';
import { AccessTokens } from './AccessTokens';
import { DeviceForm } from './DeviceForm';
import { Devices } from './Devices';
import { TrackedDeviceForm } from './TrackedDeviceForm';
import { TrackedDevices } from './TrackedDevices';

// type Views =
//   | 'devices'
//   | 'deviceForm'
//   | 'accessTokens'
//   | 'accessTokenForm'
//   | 'trackedDevices'
//   | 'trackedDeviceForm';

type Props = { show: boolean };

export function TrackingModal({ show }: Props): ReactElement {
  const view = useSelector((state) =>
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
