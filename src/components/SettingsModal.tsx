import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useCallback, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function SettingsModal({ show }: Props): ReactElement {
  const initEleSmoothingFactor = useSelector(
    (state) => state.main.eleSmoothingFactor,
  );

  const user = useSelector((state) => state.auth.user);

  const m = useMessages();

  const [eleSmoothingFactor, setEleSmoothingFactor] = useState(
    initEleSmoothingFactor,
  );

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [sendGalleryEmails, setSendGalleryEmails] = useState(
    user?.sendGalleryEmails ?? true,
  );

  const dispatch = useDispatch();

  const userMadeChanges =
    eleSmoothingFactor !== initEleSmoothingFactor ||
    (user &&
      (name !== (user.name ?? '') ||
        email !== (user.email ?? '') ||
        sendGalleryEmails !== user?.sendGalleryEmails));

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const DeleteInfo = m?.settings.account.DeleteInfo;

  function getMapSettings() {
    return (
      <>
        <Form.Group>
          <Form.Label>
            {m?.settings.trackViewerEleSmoothing.label(eleSmoothingFactor)}
          </Form.Label>

          <Form.Control
            type="range"
            custom
            value={eleSmoothingFactor}
            min={1}
            max={10}
            step={1}
            onChange={(e) =>
              setEleSmoothingFactor(Number(e.currentTarget.value))
            }
          />
        </Form.Group>

        <Alert variant="secondary">
          {m?.settings.trackViewerEleSmoothing.info}
        </Alert>
      </>
    );
  }

  return (
    <Modal show={show} onHide={close}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              trackViewerEleSmoothingFactor: eleSmoothingFactor,
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
            <FaCog /> {m?.mainMenu.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {user ? (
            <Card>
              <Card.Body>
                <Card.Title>{m?.settings.tab.map}</Card.Title>

                {getMapSettings()}
              </Card.Body>
            </Card>
          ) : (
            getMapSettings()
          )}

          {user && (
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>{m?.settings.tab.account}</Card.Title>

                <Alert variant="warning">{DeleteInfo && <DeleteInfo />}</Alert>

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
              </Card.Body>
            </Card>
          )}
        </Modal.Body>

        <Modal.Footer>
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
