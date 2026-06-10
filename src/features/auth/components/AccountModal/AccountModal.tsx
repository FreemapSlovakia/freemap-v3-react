import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import {
  authDeleteAccount,
  authInit,
  authStartLogout,
} from '@features/auth/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useBecomePremium } from '@shared/hooks/useBecomePremium.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import {
  FaAddressCard,
  FaEraser,
  FaGem,
  FaShoppingBasket,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AuthProvidersSection } from './AuthProvidersSection.js';
import { PersonalInfoSection } from './PersonalInfoSection.js';
import { PurchasesSection } from './PurchasesSection.js';

type Props = { show: boolean };

export default function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const becomePremium = useBecomePremium();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleDeleteClick = useCallback(() => {
    dispatch(setActiveModal(null));

    dispatch(
      toastsAdd({
        id: 'account.delete',
        messageKey: 'settings.account.deleteWarning',
        style: 'danger',
        actions: [
          {
            nameKey: 'general.delete',
            variant: 'danger',
            action: authDeleteAccount(),
          },
          {
            nameKey: 'general.cancel',
            variant: 'dark',
          },
        ],
      }),
    );
  }, [dispatch]);

  useDocumentTitle(show ? m?.mainMenu.account : undefined);

  if (!user) {
    return null;
  }

  return (
    <Modal show={show} onHide={close} contentClassName="bg-body-tertiary">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser /> {m?.mainMenu.account}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-body-tertiary">
        <Accordion defaultActiveKey="payments">
          <Accordion.Item eventKey="payments">
            <Accordion.Header>
              <span>
                <FaShoppingBasket /> {m?.purchases.purchases}
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <PurchasesSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="personal">
            <Accordion.Header>
              <span>
                <FaAddressCard /> {m?.settings.account.personalInfo}
              </span>
            </Accordion.Header>

            <Accordion.Body className="bg-body-tertiary">
              <PersonalInfoSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="accounts">
            <Accordion.Header>
              <span>
                <FaUserCircle /> {m?.settings.account.authProviders}
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <AuthProvidersSection />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        {becomePremium && (
          <>
            <Button onClick={becomePremium}>
              <FaGem /> {m?.premium.becomePremium}
            </Button>

            <div style={{ flexBasis: '100%' }} />
          </>
        )}

        <Button
          variant="secondary"
          onClick={() => {
            dispatch(authStartLogout());

            close();
          }}
        >
          <FaSignOutAlt /> {m?.mainMenu.logOut}
        </Button>

        <Button variant="danger" onClick={handleDeleteClick}>
          <FaEraser /> {m?.settings.account.delete}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
