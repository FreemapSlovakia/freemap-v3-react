import { Text } from '@features/l10n/Text.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { CODE_PATTERN, cleanCode } from '../emailCode.js';
import { useAuthMessages } from '../translations/useAuthMessages.js';
import type { EmailCodeState } from '../useEmailCode.js';

/** The API refuses another code to the same address sooner. */
const RESEND_SECONDS = 60;

type Props = {
  state: EmailCodeState;
  confirmLabel: ReactNode;
  confirmIcon: ReactNode;
  disabled?: boolean;
  /** More buttons after Send again. */
  children?: ReactNode;
};

/** The step after a code is sent: entering it, or sending another. */
export function EmailCodeEntry({
  state,
  confirmLabel,
  confirmIcon,
  disabled,
  children,
}: Props): ReactElement | null {
  const am = useAuthMessages();

  const online = useOnline();

  const { sentTo, sentAt, code, setCode, busy, send, confirm } = state;

  // Ticks here, not in the hook, so only this re-renders each second.
  const [now, setNow] = useState(() => Date.now());

  const resendIn = Math.max(
    0,
    Math.ceil((sentAt + RESEND_SECONDS * 1000 - Math.max(now, sentAt)) / 1000),
  );

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setNow(Date.now()), 1000);

    return () => window.clearTimeout(timer);
  }, [resendIn]);

  if (sentTo === undefined) {
    return null;
  }

  const blocked = disabled || !online || busy;

  const complete = CODE_PATTERN.test(code);

  return (
    <>
      <Alert variant="info" className="mb-2">
        {am?.emailCode.sent({ email: sentTo })}
      </Alert>

      <Form.Group controlId="email-code" className="mb-2">
        <Form.Label>
          <Text m={am} k="emailCode.code" />
        </Form.Label>

        <Form.Control
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          onKeyDown={(e) => {
            // Not a surrounding form's submit, e.g. the account's Save.
            if (e.key === 'Enter') {
              e.preventDefault();

              if (!blocked && complete) {
                confirm();
              }
            }
          }}
        />
      </Form.Group>

      <div className="d-flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={blocked || !complete}
          onClick={() => confirm()}
        >
          {confirmIcon} {confirmLabel}
        </Button>

        <Button
          variant="secondary"
          disabled={blocked || resendIn > 0}
          onClick={() => send(sentTo)}
        >
          <FaEnvelope />{' '}
          {resendIn > 0
            ? am?.emailCode.resendIn({ seconds: resendIn })
            : am?.emailCode.resend}
        </Button>

        {children}
      </div>
    </>
  );
}
