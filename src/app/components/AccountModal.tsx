import { useBecomePremium } from '@/hooks/useBecomePremium.js';
import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { AuthProviders } from '@features/auth/components/AuthProviders.js';
import {
  authDeleteAccount,
  authFetchPurchases,
  authInit,
  authStartLogout,
} from '@features/auth/model/actions.js';
import type { Purchase } from '@features/auth/model/types.js';
import { CreditsAlert } from '@features/credits/components/CredistAlert.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  JSX,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Accordion, Alert, Button, Form, Modal, Table } from 'react-bootstrap';
import {
  FaAddressCard,
  FaCheck,
  FaEraser,
  FaExclamationTriangle,
  FaGem,
  FaShoppingBasket,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default AccountModal;

export function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authFetchPurchases());
  }, [dispatch]);

  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const purchasesUnsorted = useAppSelector((state) => state.auth.purchases);

  const purchases = useMemo(
    () =>
      [...(purchasesUnsorted ?? [])].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    [purchasesUnsorted],
  );

  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const becomePremium = useBecomePremium();

  const userMadeChanges =
    user && (name !== user.name || email !== (user.email ?? ''));

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleDeleteClick = () => {
    dispatch(setActiveModal(null));

    dispatch(
      toastsAdd({
        id: 'account.delete',
        messageKey: 'settings.account.deleteWarning',
        style: 'danger',
        actions: [
          {
            nameKey: 'general.delete',
            style: 'danger',
            action: authDeleteAccount(),
          },
          {
            nameKey: 'general.cancel',
            style: 'dark',
          },
        ],
      }),
    );
  };

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  function itemToString(item: Purchase): undefined | string | JSX.Element {
    switch (item.type) {
      case 'premium':
        return m?.purchases.premium;
      case 'credits':
        return m?.purchases.credits(item.amount);
      default:
        return 'Unknown';
    }
  }

  const invalidEmail =
    !!email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const invalidName = !name.trim();

  return !user ? null : (
    <Modal show={show} onHide={close}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              user: {
                name: name.trim(),
                email: email.trim() || null,
              },
            }),
          );
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser /> {m?.mainMenu.account}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-body-tertiary">
          <Accordion>
            <Accordion.Item eventKey="payments">
              <Accordion.Header>
                <span>
                  <FaShoppingBasket /> {m?.purchases.purchases}
                </span>
              </Accordion.Header>

              <Accordion.Body>
                {becomePremium ? (
                  <Alert
                    variant="warning"
                    className="d-flex justify-content-between"
                  >
                    <span>
                      <FaExclamationTriangle />{' '}
                      {user.premiumExpiration
                        ? m?.purchases.premiumExpired(
                            <b>{dateFormat.format(user.premiumExpiration!)}</b>,
                          )
                        : m?.purchases.notPremiumYet}
                    </span>

                    <Button onClick={becomePremium} className="m-n2 ms-2">
                      <FaGem /> {m?.premium.becomePremium}
                    </Button>
                  </Alert>
                ) : (
                  <Alert variant="success">
                    <FaGem />{' '}
                    {m?.premium.youArePremium(
                      dateFormat.format(user.premiumExpiration!),
                    )}
                  </Alert>
                )}

                <CreditsAlert buy explainCredits />

                <Table>
                  <thead>
                    <tr>
                      <th>{m?.purchases.date}</th>
                      <th>{m?.purchases.item}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!purchases ? (
                      <tr key="loading">
                        <td colSpan={2} className="text-center">
                          {m?.general.loading}
                        </td>
                      </tr>
                    ) : purchases.length === 0 ? (
                      <tr key="empty">
                        <td colSpan={2} className="text-center">
                          {m?.purchases.noPurchases}
                        </td>
                      </tr>
                    ) : (
                      [...purchases].sort().map((purchase, i) => (
                        <tr key={i}>
                          <td>{dateFormat.format(purchase.createdAt)}</td>
                          <td>{itemToString(purchase.item)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="personal">
              <Accordion.Header>
                <span>
                  <FaAddressCard /> {m?.settings.account.personalInfo}
                </span>
              </Accordion.Header>

              <Accordion.Body>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label className="required">
                    {m?.settings.account.name}
                  </Form.Label>

                  <Form.Control
                    value={name}
                    isInvalid={invalidName}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    required
                    maxLength={255}
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>{m?.settings.account.email}</Form.Label>

                  <Form.Control
                    type="email"
                    value={email}
                    isInvalid={invalidEmail}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    maxLength={255}
                  />
                </Form.Group>

                <Button
                  className="ms-auto d-block"
                  variant="primary"
                  type="submit"
                  disabled={!userMadeChanges || invalidName || invalidEmail}
                >
                  <FaCheck /> {m?.general.save}
                </Button>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="accounts">
              <Accordion.Header>
                <span>
                  <FaUserCircle /> {m?.settings.account.authProviders}
                </span>
              </Accordion.Header>

              <Accordion.Body>
                {user.authProviders.length < 4 && (
                  <>
                    <p>{m?.auth.connect.label}</p>

                    <AuthProviders mode="connect" />

                    <hr />
                  </>
                )}

                <p>{m?.auth.disconnect.label}</p>

                <AuthProviders mode="disconnect" />
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
            type="button"
            onClick={() => {
              dispatch(authStartLogout());

              close();
            }}
          >
            <FaSignOutAlt /> {m?.mainMenu.logOut}
          </Button>

          <Button variant="danger" type="button" onClick={handleDeleteClick}>
            <FaEraser /> {m?.settings.account.delete}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
