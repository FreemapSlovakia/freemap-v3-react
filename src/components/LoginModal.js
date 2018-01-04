import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { authLoginWithOsm, authLoginWithFacebook, authLoginWithGoogle, authLoginClose } from 'fm3/actions/authActions';
import injectL10n from 'fm3/l10nInjector';

function LoginModal({ onClose, onLoginWithFacebook, onLoginWithGoogle, onLoginWithOsm, t }) {
  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="sign-in" /> {t('more.logIn')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={onLoginWithFacebook} bsSize="large" block style={{ backgroundColor: '#3b5998', color: '#fff' }}>
          <FontAwesomeIcon icon="facebook-official" /> {t('logIn.with.facebook')}
        </Button>
        <Button onClick={onLoginWithGoogle} bsSize="large" block style={{ backgroundColor: '#DB4437', color: '#fff' }}>
          <FontAwesomeIcon icon="google" /> {t('logIn.with.google')}
        </Button>
        <Button onClick={onLoginWithOsm} bsSize="large" block style={{ backgroundColor: '#8bdc81', color: '#585858' }}>
          <FontAwesomeIcon icon="map-o" /> {t('logIn.with.osm')}
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}><Glyphicon glyph="remove" /> {t('general.close')}</Button>
      </Modal.Footer>
    </Modal>
  );
}

LoginModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onLoginWithFacebook: PropTypes.func.isRequired,
  onLoginWithGoogle: PropTypes.func.isRequired,
  onLoginWithOsm: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
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
  ),
)(LoginModal);
