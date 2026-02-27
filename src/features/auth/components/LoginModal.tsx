import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { FaExclamationTriangle, FaSignInAlt, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AuthProviders } from './AuthProviders.js';

type Props = { show: boolean };

export function LoginModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const purchaseOnLogin = useAppSelector((state) => state.auth.purchaseOnLogin);

  const renderPremiumInfo = () =>
    purchaseOnLogin?.type === 'premium' ? (
      <Alert variant="primary">
        {m?.premium.commonHeader}
        {m?.premium.stepsForAnonymous}
      </Alert>
    ) : null;

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

        {renderPremiumInfo()}

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
