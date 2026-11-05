import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { Text } from '@features/l10n/Text.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FaEnvelope, FaSignInAlt } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { isValidEmail } from '../emailCode.js';
import { handleLoginResponse } from '../model/processors/loginResponseHandler.js';
import { useAuthMessages } from '../translations/useAuthMessages.js';
import { useEmailCode } from '../useEmailCode.js';
import { EmailCodeEntry } from './EmailCodeEntry.js';

export function EmailLogin(): ReactElement {
  const am = useAuthMessages();

  const online = useOnline();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const cookieConsentResult = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult,
  );

  const [email, setEmail] = useState('');

  const emailCode = useEmailCode('login', async (address, code) => {
    const res = await httpRequest({
      getState: store.getState,
      method: 'POST',
      url: '/auth/login-email',
      cancelActions: [],
      expectedStatus: 200,
      data: {
        email: address,
        code,
        language: store.getState().l10n.chosenLanguage,
      },
    });

    await handleLoginResponse(res, store.getState, dispatch, null);

    // After: closing drops the purchase waiting for this login, and a
    // follow-up may have opened another modal.
    if (store.getState().main.activeModal?.type === 'login') {
      dispatch(setActiveModal(null));
    }
  });

  const address = email.trim();

  const valid = isValidEmail(address);

  const noConsent = cookieConsentResult === null;

  const canSend = online && !emailCode.busy && !noConsent && valid;

  return (
    <>
      <p className="text-center text-muted my-3">
        <Text m={am} k="emailCode.or" />
      </p>

      {emailCode.error && <Alert variant="danger">{emailCode.error}</Alert>}

      {emailCode.sentTo === undefined ? (
        <Form
          onSubmit={(e) => {
            e.preventDefault();

            if (canSend) {
              emailCode.send(address);
            }
          }}
        >
          <Form.Group controlId="login-email" className="mb-3">
            <Form.Label>
              <Text m={am} k="emailCode.email" />
            </Form.Label>

            <Form.Control
              type="email"
              autoComplete="email"
              maxLength={255}
              value={email}
              isInvalid={address !== '' && !valid}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="secondary" disabled={!canSend}>
            <FaEnvelope /> <Text m={am} k="emailCode.send" />
          </Button>
        </Form>
      ) : (
        <EmailCodeEntry
          state={emailCode}
          disabled={noConsent}
          confirmIcon={<FaSignInAlt />}
          confirmLabel={<Text m={am} k="emailCode.logIn" />}
        >
          <Button
            variant="secondary"
            disabled={emailCode.busy}
            onClick={emailCode.reset}
          >
            <Text m={am} k="emailCode.otherAddress" />
          </Button>
        </EmailCodeEntry>
      )}
    </>
  );
}
