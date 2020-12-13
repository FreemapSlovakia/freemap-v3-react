import {
  authLoginClose,
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginWithOsm,
} from 'fm3/actions/authActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function LoginModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(authLoginClose());
  }, [dispatch]);

  const loginWithFacebook = useCallback(() => {
    dispatch(authLoginWithFacebook());
  }, [dispatch]);

  const loginWithGoogle = useCallback(() => {
    dispatch(authLoginWithGoogle());
  }, [dispatch]);

  const loginWithOsm = useCallback(() => {
    dispatch(authLoginWithOsm());
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="sign-in" /> {m?.more.logIn}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          onClick={loginWithFacebook}
          size="lg"
          block
          style={{ backgroundColor: '#3b5998', color: '#fff' }}
        >
          <FontAwesomeIcon icon="facebook-official" /> {m?.logIn.with.facebook}
        </Button>
        <Button
          onClick={loginWithGoogle}
          size="lg"
          block
          style={{ backgroundColor: '#DB4437', color: '#fff' }}
        >
          <FontAwesomeIcon icon="google" /> {m?.logIn.with.google}
        </Button>
        <Button
          onClick={loginWithOsm}
          size="lg"
          block
          style={{ backgroundColor: '#8bdc81', color: '#585858' }}
        >
          <FontAwesomeIcon icon="map-o" /> {m?.logIn.with.osm}
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FontAwesomeIcon icon="close" /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
