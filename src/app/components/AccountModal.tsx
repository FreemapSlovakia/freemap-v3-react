import { AuthProviders } from '@features/auth/components/AuthProviders.js';
import {
  authDeleteAccount,
  authInit,
  authStartLogout,
} from '@features/auth/model/actions.js';
import type {
  Purchase,
  PurchasesResponse,
} from '@features/auth/model/types.js';
import { CreditsAlert } from '@features/credits/components/CredistAlert.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useBecomePremium } from '@shared/hooks/useBecomePremium.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  JSX,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Accordion,
  Alert,
  Button,
  Form,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap';
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
import { assert } from 'typia';
import { StringDates } from '@/shared/types/common.js';
import { saveSettings, setActiveModal } from '../store/actions.js';

type Props = { show: boolean };

export default AccountModal;

export function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authInit());
  }, [dispatch]);

  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [description, setDescription] = useState(user?.description ?? '');

  const becomePremium = useBecomePremium();

  const userMadeChanges =
    user &&
    (name !== user.name ||
      email !== (user.email ?? '') ||
      description !== (user.description ?? ''));

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
  }, [dispatch]);

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
    Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const invalidName = !name.trim();

  const [state, setState] = useState<
    | { type: 'error'; error: unknown }
    | { type: 'fetching' }
    | {
        type: 'success';
        result: PurchasesResponse;
      }
  >({ type: 'fetching' });

  const authToken = user?.authToken;

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      const res = await fetch(process.env['API_URL'] + '/auth/purchases', {
        signal: ac.signal,
        headers: {
          accept: 'application/json',
          ...(authToken ? { authorization: 'Bearer ' + authToken } : {}),
        },
      });

      if (!res.ok) {
        throw new Error();
      }

      const raw = assert<StringDates<PurchasesResponse>>(await res.json());

      setState({
        type: 'success',
        result: {
          purchases: raw.purchases.map(({ createdAt, ...rest }) => ({
            ...rest,
            createdAt: new Date(createdAt),
          })),
          intents: raw.intents.map(
            ({ createdAt, updatedAt, expireAt, ...rest }) => ({
              ...rest,
              createdAt: new Date(createdAt),
              updatedAt: new Date(updatedAt),
              expireAt: new Date(expireAt),
            }),
          ),
        },
      });
    })().catch((error) => {
      if (ac.signal.aborted) {
        return;
      }

      setState({ type: 'error', error });
    });

    return () => {
      ac.abort();
    };
  }, [authToken]);

  const showAwaitingBankPayment = Boolean(
    state.type === 'success' &&
      state.result.intents?.some(
        (intent) => intent.status === 'awaiting_payment',
      ),
  );

  const showBankPaymentFailed = Boolean(
    state.type === 'success' &&
      state.result.intents?.some((intent) => intent.status === 'rejected'),
  );

  const t = m?.purchases.bankIntentStatus;

  const bankStatusMessages = useMemo(() => {
    if (!t || state.type !== 'success') {
      return [];
    }

    const statuses = new Set<string>(
      state.result.intents
        .map((intnet) => intnet.bankIntentStatus)
        .filter((bankIntentStatus) => bankIntentStatus !== null),
    );

    const out: string[] = [];

    const push = (status: string, text: string) => {
      if (statuses.has(status)) {
        out.push(text);
      }
    };

    push('pending_settlement', t.pending_settlement);
    push('manual_review', t.manual_review);
    push('paid', t.paid);
    push('expired', t.expired);
    push('failed', t.failed);
    push('rejected', t.rejected);
    push('created', t.created);

    for (const status of statuses) {
      if (
        ![
          'pending_settlement',
          'manual_review',
          'paid',
          'expired',
          'failed',
          'rejected',
          'created',
          '',
        ].includes(status)
      ) {
        out.push(t.unknown.replace('{}', status));
      }
    }

    return out;
  }, [t, state]);

  if (!user) {
    return null;
  }

  return (
    <Modal show={show} onHide={close}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              user: {
                name: name.trim(),
                email: email.trim() || null,
                description: description.trim() || null,
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
          <Accordion defaultActiveKey="payments">
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

                {(() => {
                  switch (state.type) {
                    case 'fetching':
                      return (
                        <div className="d-flex flex-column">
                          <Spinner
                            className="align-self-center"
                            animation="border"
                          />
                        </div>
                      );
                    case 'error':
                      return (
                        <Alert variant="danger">
                          {m?.general.loadError({
                            err: state.error?.toString() ?? '',
                          })}
                        </Alert>
                      );
                    case 'success':
                      return (
                        <>
                          {showAwaitingBankPayment && (
                            <Alert variant="info">
                              <FaShoppingBasket />{' '}
                              {m?.purchases.awaitingBankPayment}
                            </Alert>
                          )}

                          {showBankPaymentFailed && (
                            <Alert variant="danger">
                              <FaExclamationTriangle />{' '}
                              {m?.purchases.bankPaymentFailed}
                            </Alert>
                          )}

                          {bankStatusMessages.length > 0 && (
                            <Alert variant="secondary">
                              <ul className="mb-0 ps-3">
                                {bankStatusMessages.map((message) => (
                                  <li key={message}>{message}</li>
                                ))}
                              </ul>
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
                              {state.result.purchases.length === 0 ? (
                                <tr key="empty">
                                  <td colSpan={2} className="text-center">
                                    {m?.purchases.noPurchases}
                                  </td>
                                </tr>
                              ) : (
                                state.result.purchases.map((purchase, i) => (
                                  <tr key={i}>
                                    <td>
                                      {dateFormat.format(purchase.createdAt)}
                                    </td>
                                    <td>{itemToString(purchase.item)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </Table>
                        </>
                      );
                  }
                })()}
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

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>{m?.settings.account.description}</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
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
                {user.authProviders.length < 5 && (
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
