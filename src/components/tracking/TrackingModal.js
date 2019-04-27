import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/lib/Modal';

import { setActiveModal } from 'fm3/actions/mainActions';
import Devices from './Devices';
import DeviceForm from './DeviceForm';
import AccessTokens from './AccessTokens';
import AccessTokenForm from './AccessTokenForm';

function TrackingModal({ onClose, view }) {
  return (
    <Modal onHide={onClose} show bsSize="large">
      {view === 'devices' && <Devices />}
      {view === 'device-form' && <DeviceForm />}
      {view === 'accessTokens' && <AccessTokens />}
      {view === 'accessToken-form' && <AccessTokenForm />}
    </Modal>
  );
}

TrackingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['devices', 'device-form', 'accessTokens']).isRequired,
};

export default connect(
  state => ({
    devices: state.tracking.devices,
    view: state.tracking.modifiedDeviceId !== undefined ? 'device-form'
      : state.tracking.accessTokensDeviceId ? (state.tracking.modifiedAccessTokenId !== undefined ? 'accessToken-form' : 'accessTokens')
        : 'devices',
  }),
  dispatch => ({
    onClose() {
      dispatch(setActiveModal(null));
    },
  }),
)(TrackingModal);
