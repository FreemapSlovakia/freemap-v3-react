import { setActiveModal } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/esm/Alert';
import Modal from 'react-bootstrap/Modal';
import { FaExclamationTriangle, FaSignInAlt, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AuthProviders } from './AuthProviders';

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
