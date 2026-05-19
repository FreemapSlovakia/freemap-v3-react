import { saveSettings } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function PersonalInfoSection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [description, setDescription] = useState(user?.description ?? '');

  if (!user) {
    return null;
  }

  const userMadeChanges =
    name !== user.name ||
    email !== (user.email ?? '') ||
    description !== (user.description ?? '');

  const invalidEmail =
    Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const invalidName = !name.trim();

  return (
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
            keepOpen: true,
          }),
        );
      }}
    >
      <Form.Group controlId="name" className="mb-3">
        <Form.Label className="required">{m?.settings.account.name}</Form.Label>

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
    </Form>
  );
}
