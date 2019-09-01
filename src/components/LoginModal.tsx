import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import {
  authLoginWithOsm,
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginClose,
} from 'fm3/actions/authActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

const LoginModal: React.FC<Props> = ({
  onClose,
  onLoginWithFacebook,
  onLoginWithGoogle,
  onLoginWithOsm,
  t,
}) => {
  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="sign-in" /> {t('more.logIn')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          onClick={onLoginWithFacebook}
          bsSize="large"
          block
          style={{ backgroundColor: '#3b5998', color: '#fff' }}
        >
          <FontAwesomeIcon icon="facebook-official" />{' '}
          {t('logIn.with.facebook')}
        </Button>
        <Button
          onClick={onLoginWithGoogle}
          bsSize="large"
          block
          style={{ backgroundColor: '#DB4437', color: '#fff' }}
        >
          <FontAwesomeIcon icon="google" /> {t('logIn.with.google')}
        </Button>
        <Button
          onClick={onLoginWithOsm}
          bsSize="large"
          block
          style={{ backgroundColor: '#8bdc81', color: '#585858' }}
        >
          <FontAwesomeIcon icon="map-o" /> {t('logIn.with.osm')}
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <Glyphicon glyph="remove" /> {t('general.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
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
});

export default connect(
  undefined,
  mapDispatchToProps,
)(withTranslator(LoginModal));
