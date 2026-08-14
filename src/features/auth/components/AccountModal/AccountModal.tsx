import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import {
  authDeleteAccount,
  authInit,
  authStartLogout,
} from '@features/auth/model/actions.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { loadMyMapsMessages } from '@features/myMaps/translations/loadMyMapsMessages.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { PurchasesSection } from '@features/purchases/components/PurchasesSection.js';
import { usePurchasesMessages } from '@features/purchases/translations/usePurchasesMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Accordion, Button, Modal } from 'react-bootstrap';
import {
  FaAddressCard,
  FaEraser,
  FaShoppingBasket,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AuthProvidersSection } from './AuthProvidersSection.js';
import { PersonalInfoSection } from './PersonalInfoSection.js';

type Props = { show: boolean };

export default function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const am = useAuthMessages();

  const pm = usePurchasesMessages();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const mm = useMyMapsMessages();

  const confirm = useConfirm();

  const language = useAppSelector((state) => state.l10n.language);

  const unsentCount = useAppSelector((state) => state.myMaps.outbox.length);

  // Logging out drops the queued saves along with everything else this account
  // left in the browser, so work that never reached the server is said out loud
  // rather than disappearing.
  const handleLogoutClick = useCallback(async () => {
    if (unsentCount > 0) {
      // The My Maps bundle is loaded on its own schedule, and a warning has to
      // say what it is warning about — so it is awaited rather than shown empty.
      const mmm = mm ?? (await loadMyMapsMessages(language));

      if (
        !(await confirm({
          title: mmm.logoutUnsentTitle,
          message: mmm.logoutUnsentWarning({ count: unsentCount }),
          confirmLabel: m?.mainMenu.logOut,
          confirmStyle: 'danger',
        }))
      ) {
        return;
      }
    }

    dispatch(authStartLogout());

    close();
  }, [unsentCount, confirm, mm, language, m, dispatch, close]);

  const handleDeleteClick = useCallback(() => {
    dispatch(setActiveModal(null));

    dispatch(
      toastsAdd({
        id: 'account.delete',
        messageKey: 'account.deleteWarning',
        messageLoader: loadAuthMessages,
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
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
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
                <FaShoppingBasket /> {pm?.purchases}
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <PurchasesSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="personal">
            <Accordion.Header>
              <span>
                <FaAddressCard /> {am?.account.personalInfo}
              </span>
            </Accordion.Header>

            <Accordion.Body className="bg-body-tertiary">
              <PersonalInfoSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="accounts">
            <Accordion.Header>
              <span>
                <FaUserCircle /> {am?.account.authProviders}
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <AuthProvidersSection />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleLogoutClick}>
          <FaSignOutAlt /> {m?.mainMenu.logOut}
        </Button>

        <Button variant="danger" onClick={handleDeleteClick}>
          <FaEraser /> {am?.account.delete}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
