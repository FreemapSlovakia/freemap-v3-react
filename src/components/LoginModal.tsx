import {
  authLoginWithFacebook,
  authLoginWithGarmin,
  authLoginWithGoogle,
  authLoginWithOsm,
} from 'fm3/actions/authActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/esm/Alert';
import Modal from 'react-bootstrap/Modal';
import {
  FaExclamationTriangle,
  FaFacebook,
  FaGoogle,
  FaSignInAlt,
  FaTimes,
} from 'react-icons/fa';
import { SiGarmin, SiOpenstreetmap } from 'react-icons/si';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export function LoginModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
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

  const loginWithGarmin = useCallback(() => {
    dispatch(authLoginWithGarmin());
  }, [dispatch]);

  const cookieConsentResult = useAppSelector(
    (state) => state.main.cookieConsentResult,
  );

  const removeAds = useAppSelector((state) => state.main.removeAdsOnLogin);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaSignInAlt /> {m?.mainMenu.logIn}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cookieConsentResult === null && (
          <Alert variant="warning">
            <FaExclamationTriangle /> {m?.general.noCookies}
          </Alert>
        )}

        {removeAds ? (
          <Alert variant="primary">{m?.removeAds.info}</Alert>
        ) : null}

        <Button
          onClick={loginWithFacebook}
          size="lg"
          block
          style={{ backgroundColor: '#3b5998', color: '#fff' }}
          disabled={cookieConsentResult === null}
        >
          <FaFacebook />
          &ensp;{m?.logIn.with.facebook}
        </Button>

        <Button
          onClick={loginWithGoogle}
          size="lg"
          block
          style={{ backgroundColor: '#DB4437', color: '#fff' }}
          disabled={cookieConsentResult === null}
        >
          <FaGoogle />
          &ensp;{m?.logIn.with.google}
        </Button>

        <Button
          onClick={loginWithOsm}
          size="lg"
          block
          style={{ backgroundColor: '#8bdc81', color: '#585858' }}
          disabled={cookieConsentResult === null}
        >
          <SiOpenstreetmap />
          &ensp;{m?.logIn.with.osm}
        </Button>

        <Button
          onClick={loginWithGarmin}
          size="lg"
          block
          style={{ backgroundColor: '#1791FF', color: '#fff' }}
          disabled={cookieConsentResult === null}
        >
          <SiGarmin style={{ fontSize: '400%', marginBlock: '-24px' }} />
          &ensp;
          {m?.logIn.with.garmin}
        </Button>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LoginModal;
