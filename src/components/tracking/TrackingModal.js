import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';

import { setActiveModal } from 'fm3/actions/mainActions';
import Devices from './Devices';
import DeviceForm from './DeviceForm';
import AccessTokens from './AccessTokens';
import AccessTokenForm from './AccessTokenForm';
import TrackedDevices from './TrackedDevices';
import TrackedDeviceForm from './TrackedDeviceForm';

function TrackingModal({ onClose, view }) {
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
}

TrackingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['devices', 'deviceForm', 'accessTokens', 'accessTokenForm', 'trackedDevices', 'trackedDeviceForm']).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
    view: state.main.activeModal === 'tracking-my' ? (
      state.tracking.modifiedDeviceId !== undefined ? 'deviceForm'
        : state.tracking.accessTokensDeviceId ? (state.tracking.modifiedAccessTokenId !== undefined ? 'accessTokenForm' : 'accessTokens')
          : 'devices') : (
      state.tracking.modifiedTrackedDeviceId !== undefined ? 'trackedDeviceForm' : 'trackedDevices'),
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(TrackingModal);
