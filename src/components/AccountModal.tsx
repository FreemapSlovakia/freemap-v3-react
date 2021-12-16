import { authStartLogout } from 'fm3/actions/authActions';
import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export default AccountModal;

export function AccountModal({ show }: Props): ReactElement | null {
  const user = useSelector((state) => state.auth.user);

  const m = useMessages();

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [sendGalleryEmails, setSendGalleryEmails] = useState(
    user?.sendGalleryEmails ?? true,
  );

  const dispatch = useDispatch();

  const userMadeChanges =
    user &&
    (name !== (user.name ?? '') ||
      email !== (user.email ?? '') ||
      sendGalleryEmails !== user?.sendGalleryEmails);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const DeleteInfo = m?.settings.account.DeleteInfo;

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
              user: user
                ? {
                    name: name.trim(),
                    email: email.trim() || null,
                    sendGalleryEmails,
                  }
                : undefined,
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
          {DeleteInfo && (
            <Alert variant="warning">
              <DeleteInfo />
            </Alert>
          )}

          <Form.Group>
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

          <Form.Group>
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
            id="chk-galEmails"
            type="checkbox"
            onChange={(e) => {
              setSendGalleryEmails(e.currentTarget.checked);
            }}
            checked={sendGalleryEmails}
            label={m?.settings.account.sendGalleryEmails}
          />
        </Modal.Body>

        <Modal.Footer>
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

          <Button variant="primary" type="submit" disabled={!userMadeChanges}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
