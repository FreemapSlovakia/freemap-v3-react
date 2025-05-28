import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Accordion, Button, Form, Modal, Table } from 'react-bootstrap';
import {
  FaAddressCard,
  FaCheck,
  FaEraser,
  FaGem,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserCircle,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  authDeleteAccount,
  authFetchPurchases,
  authStartLogout,
} from '../actions/authActions.js';
import { saveSettings, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useDateTimeFormat } from '../hooks/useDateTimeFormat.js';
import { useMessages } from '../l10nInjector.js';
import { AuthProviders } from './AuthProviders.js';

type Props = { show: boolean };

export default AccountModal;

export function AccountModal({ show }: Props): ReactElement | null {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authFetchPurchases());
  }, [dispatch]);

  const purchasesUnsorted = useAppSelector((state) => state.auth.purchases);

  const purchases = useMemo(
    () =>
      [...(purchasesUnsorted ?? [])].sort(
        (a, b) =>
          b.expireAt.getTime() - a.expireAt.getTime() ||
          b.createdAt.getTime() - a.createdAt.getTime(),
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

        <Modal.Body className="bg-light">
          <Accordion defaultActiveKey="personal">
            {!becomePremium && (
              <Accordion.Item eventKey="paylents">
                <Accordion.Header>
                  <span>
                    <FaGem /> {m?.premium.youArePremium}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  {!purchases ? (
                    '…'
                  ) : (
                    <Table>
                      <thead>
                        <tr>
                          <th>{m?.general.createdAt}</th>
                          <th>{m?.general.expiration}</th>
                          <th>{m?.tracking.accessToken.note}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...purchases].sort().map((purchase, i) => (
                          <tr
                            key={i}
                            className={
                              purchase.expireAt.getTime() > Date.now()
                                ? 'table-success'
                                : 'table-danger'
                            }
                          >
                            <td>{dateFormat.format(purchase.createdAt)}</td>
                            <td>{dateFormat.format(purchase.expireAt)}</td>
                            <td>{purchase.article}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            )}

            <Accordion.Item eventKey="personal">
              <Accordion.Header>
                <span>
                  <FaAddressCard /> {m?.settings.account.personalInfo}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>{m?.settings.account.name}</Form.Label>

                  <Form.Control
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    required
                    maxLength={255}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{m?.settings.account.email}</Form.Label>

                  <Form.Control
                    type="email"
                    value={email}
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
                  disabled={!userMadeChanges}
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
                    <hr />

                    <p>{m?.auth.connect.label}</p>

                    <AuthProviders mode="connect" />
                  </>
                )}

                <hr />

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
