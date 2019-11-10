import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';

import { setActiveModal } from 'fm3/actions/mainActions';
import { Devices } from './Devices';
import { DeviceForm } from './DeviceForm';
import { AccessTokens } from './AccessTokens';
import { AccessTokenForm } from './AccessTokenForm';
import { TrackedDevices } from './TrackedDevices';
import { TrackedDeviceForm } from './TrackedDeviceForm';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

// type Views =
//   | 'devices'
//   | 'deviceForm'
//   | 'accessTokens'
//   | 'accessTokenForm'
//   | 'trackedDevices'
//   | 'trackedDeviceForm';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const TrackingModalInt: React.FC<Props> = ({ onClose, view }) => {
  return (
    <Modal onHide={onClose} show bsSize="large">
      {view === 'devices' && <Devices />}
      {view === 'deviceForm' && <DeviceForm />}
      {view === 'accessTokens' && <AccessTokens />}
      {view === 'accessTokenForm' && <AccessTokenForm />}
      {view === 'trackedDevices' && <TrackedDevices />}
      {view === 'trackedDeviceForm' && <TrackedDeviceForm />}
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  devices: state.tracking.devices,
  view:
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
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onClose() {
    dispatch(setActiveModal(null));
  },
});

export const TrackingModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TrackingModalInt);
