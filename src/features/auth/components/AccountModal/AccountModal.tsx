import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import {
  type AccountSection,
  AccountSectionSchema,
} from '@app/store/activeModal.js';
import {
  authDeleteAccount,
  authInit,
  authStartLogout,
} from '@features/auth/model/actions.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { namedRoles } from '@features/auth/translations/namedRoles.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { loadMyMapsMessages } from '@features/myMaps/translations/loadMyMapsMessages.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { PurchasesSection } from '@features/purchases/components/PurchasesSection.js';
import { usePurchasesMessages } from '@features/purchases/translations/usePurchasesMessages.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { HintTooltip } from '@shared/components/HintTooltip.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { askBeforeClosing } from '@shared/modalCloseGuard.js';
import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { Accordion, Modal } from 'react-bootstrap';
import {
  FaAddressCard,
  FaEraser,
  FaKey,
  FaShoppingBasket,
  FaSignOutAlt,
  FaUser,
  FaUserCircle,
  FaUserShield,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { AppTokensSection } from './AppTokensSection.js';
import { AuthProvidersSection } from './AuthProvidersSection.js';
import { HomeLocationField } from './HomeLocationField.js';
import { PersonalInfoSection } from './PersonalInfoSection.js';

type Props = { show: boolean };

export default function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  const online = useOnline();

  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const urlSection = useAppSelector((state) =>
    state.main.activeModal?.type === 'account'
      ? state.main.activeModal.section
      : undefined,
  );

  // Closing clears the URL's at once; the section stays open while it fades.
  const [section, setSection] = useState(urlSection);

  if (show && section !== urlSection) {
    setSection(urlSection);
  }

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

  // Hidden rather than closed, so the open section stays open.
  const pickingHome = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation !== false,
  );

  // Logging out drops the queued saves along with everything else this account
  // left in the browser, so work that never reached the server is said out loud
  // rather than disappearing.
  const handleLogoutClick = async () => {
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
  };

  const handleDeleteClick = async () => {
    // Awaited rather than shown empty, like the logout warning above: a dialog
    // that asks for something irreversible has to say what it is asking.
    const amm = am ?? (await loadAuthMessages(language));

    if (
      !(await confirm({
        title: amm.account.delete,
        message: amm.account.deleteWarning,
        confirmLabel: m?.general.delete,
        confirmStyle: 'danger',
      }))
    ) {
      return;
    }

    dispatch(authDeleteAccount());

    close();
  };

  useDocumentTitle(show ? m?.mainMenu.account : undefined);

  if (!user) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={() => askBeforeClosing(close)}
      contentClassName="bg-body-tertiary"
      scrollable
      className={pickingHome ? 'd-none' : undefined}
      backdropClassName={pickingHome ? 'd-none' : undefined}
      enforceFocus={!pickingHome}
      keyboard={!pickingHome}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser /> <Text k="mainMenu.account" />
        </Modal.Title>
        <ManualHeaderButton chapter="account" />
      </Modal.Header>

      <Modal.Body className="bg-body-tertiary">
        <OfflineAlert />

        {/* The open section is the URL's (`account/<section>`), so Back,
            a reload and a shared link all keep it. */}
        <Accordion
          activeKey={section ?? null}
          onSelect={(key) => {
            const next = AccountSectionSchema.safeParse(key);

            dispatch(
              setActiveModal(
                next.success
                  ? { type: 'account', section: next.data }
                  : { type: 'account' },
              ),
            );
          }}
        >
          <Accordion.Item eventKey={'payments' satisfies AccountSection}>
            <Accordion.Header>
              <span>
                <FaShoppingBasket /> <Text m={pm} k="purchases" />
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <PurchasesSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey={'personal' satisfies AccountSection}>
            <Accordion.Header>
              <span>
                <FaAddressCard /> <Text m={am} k="account.personalInfo" />
              </span>
            </Accordion.Header>

            <Accordion.Body className="bg-body-tertiary">
              <PersonalInfoSection />

              <HomeLocationField />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey={'providers' satisfies AccountSection}>
            <Accordion.Header>
              <span>
                <FaUserCircle /> <Text m={am} k="account.authProviders" />
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <AuthProvidersSection />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey={'app-tokens' satisfies AccountSection}>
            <Accordion.Header>
              <span>
                <FaKey /> <Text m={am} k="appTokens.title" />
              </span>
            </Accordion.Header>

            <Accordion.Body>
              <AppTokensSection />
            </Accordion.Body>
          </Accordion.Item>

          {user.roles.length > 0 && (
            <Accordion.Item eventKey={'roles' satisfies AccountSection}>
              <Accordion.Header>
                <span>
                  <FaUserShield /> <Text m={am} k="account.roles" />
                </span>
              </Accordion.Header>

              <Accordion.Body>
                <ul className="mb-0">
                  {namedRoles(user.roles, am, language).map(
                    ({ role, name }) => (
                      <li key={role}>
                        <HintTooltip hint={role}>{name}</HintTooltip>
                      </li>
                    ),
                  )}
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          )}
        </Accordion>
      </Modal.Body>

      <FmModalFooter>
        {/* Logging out clears what the account left in this browser — offline
            maps, queued saves, the cached app shell — and the server has to
            answer for the session to end at all, so it waits for a connection. */}
        <FmFooterButton
          variant="secondary"
          disabled={!online}
          onClick={handleLogoutClick}
          icon={<FaSignOutAlt />}
          label={m?.mainMenu.logOut}
        />

        <FmFooterButton
          variant="danger"
          disabled={!online}
          onClick={handleDeleteClick}
          icon={<FaEraser />}
          label={am?.account.delete}
        />

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
