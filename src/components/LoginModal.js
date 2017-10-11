import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { authLoginWithOsm, authLoginWithFacebook, authLoginWithGoogle, authLoginClose } from 'fm3/actions/authActions';

function LoginModal({
  onClose, onLoginWithFacebook, onLoginWithGoogle, onLoginWithOsm,
}) {
  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Prihlásenie
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={onLoginWithFacebook} bsSize="large" block style={{ backgroundColor: '#3b5998', color: '#fff' }}>
          <FontAwesomeIcon icon="facebook-official" /> Prihlásiť sa pomocou Facebooku
        </Button>
        <Button onClick={onLoginWithGoogle} bsSize="large" block style={{ backgroundColor: '#DB4437', color: '#fff' }}>
          <FontAwesomeIcon icon="google" /> Prihlásiť sa pomocou Googlu
        </Button>
        <Button onClick={onLoginWithOsm} bsSize="large" block style={{ backgroundColor: '#8bdc81', color: '#585858' }}>
          <FontAwesomeIcon icon="map-o" /> Prihlásiť sa pomocou OpenStreetMap
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}><Glyphicon glyph="remove" /> Zavrieť</Button>
      </Modal.Footer>
    </Modal>
  );
}

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLoginWithFacebook: PropTypes.func.isRequired,
  onLoginWithGoogle: PropTypes.func.isRequired,
  onLoginWithOsm: PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onClose() {
      dispatch(authLoginClose());
    },
    onLoginWithFacebook() {
      dispatch(authLoginWithFacebook());
    },
    onLoginWithGoogle() {
      dispatch(authLoginWithGoogle());
    },
    onLoginWithOsm() {
      dispatch(authLoginWithOsm());
    },
  }),
)(LoginModal);
