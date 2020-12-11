import { useDispatch, useSelector } from 'react-redux';
import { ReactElement } from 'react';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Devices } from './Devices';
import { DeviceForm } from './DeviceForm';
import { AccessTokens } from './AccessTokens';
import { AccessTokenForm } from './AccessTokenForm';
import { TrackedDevices } from './TrackedDevices';
import { TrackedDeviceForm } from './TrackedDeviceForm';
import { RootState } from 'fm3/storeCreator';
import { Modal } from 'react-bootstrap';

// type Views =
//   | 'devices'
//   | 'deviceForm'
//   | 'accessTokens'
//   | 'accessTokenForm'
//   | 'trackedDevices'
//   | 'trackedDeviceForm';

export function TrackingModal(): ReactElement {
  const view = useSelector((state: RootState) =>
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
      show
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
