import { ReactElement, useCallback } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { FaExclamationTriangle, FaSignInAlt, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { AuthProviders } from './AuthProviders.js';

type Props = { show: boolean };

export function LoginModal({ show }: Props): ReactElement {
  const m = useMessages();
  const dispatch = useDispatch();
  
  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);
  
  const cookieConsentResult = useAppSelector(
    (state) => state.main.cookieConsentResult,
  );
  
  const removeAds = useAppSelector((state) => state.main.removeAdsOnLogin);
  const isLoggedIn = useAppSelector((state) => !!state.auth.user);
//  const infoText = isLoggedIn ? m?.premium.infoRegistered : m?.premium.infoAnonymous;
  const infoText = m?.premium.infoRegistered;
  
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
          <Alert variant="primary">
            {infoText}
          </Alert>
        ) : null}
        <p>{m?.auth.logIn.with}:</p>
        <AuthProviders mode="login" />
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
