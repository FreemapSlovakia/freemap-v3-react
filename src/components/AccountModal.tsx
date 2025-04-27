import { ReactElement, useCallback, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import {
  FaCheck,
  FaCog,
  FaEraser,
  FaGem,
  FaSignOutAlt,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { authDeleteAccount, authStartLogout } from '../actions/authActions.js';
import { saveSettings, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useMessages } from '../l10nInjector.js';
import { AuthProviders } from './AuthProviders.js';

type Props = { show: boolean };

export default AccountModal;

export function AccountModal({ show }: Props): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [sendGalleryEmails, setSendGalleryEmails] = useState(
    user?.sendGalleryEmails ?? true,
  );

  const becomePremium = useBecomePremium();

  const dispatch = useDispatch();

  const userMadeChanges =
    user &&
    (name !== (user.name ?? '') ||
      email !== (user.email ?? '') ||
      sendGalleryEmails !== user?.sendGalleryEmails);

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
                sendGalleryEmails,
              },
            }),
          );
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mainMenu.account}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!becomePremium && (
            <>
              <Form.Group className="mb-3">
                <Alert variant="success">
                  <FaGem /> {m?.premium.youArePremium}
                </Alert>
              </Form.Group>

              <hr />
            </>
          )}

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

          <Form.Check
            className="mb-3"
            id="chk-galEmails"
            type="checkbox"
            onChange={(e) => {
              setSendGalleryEmails(e.currentTarget.checked);
            }}
            checked={sendGalleryEmails}
            label={m?.settings.account.sendGalleryEmails}
          />

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
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!userMadeChanges}>
            <FaCheck /> {m?.general.save}
          </Button>

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
