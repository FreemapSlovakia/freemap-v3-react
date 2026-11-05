import { HttpError, httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { useState } from 'react';
import { useStore } from 'react-redux';
import { useAuthMessages } from './translations/useAuthMessages.js';

export type EmailCodeState = ReturnType<typeof useEmailCode>;

/**
 * Sending a code and checking it, shared by email login and the account's
 * email confirmation.
 */
export function useEmailCode(
  purpose: 'login' | 'change',
  /** Takes the code; throws on refusal. */
  submit: (address: string, code: string) => Promise<void>,
) {
  const am = useAuthMessages();

  const store = useStore<RootState>();

  // The address the code went to.
  const [sentTo, setSentTo] = useState<string>();

  // When; the resend countdown runs from it.
  const [sentAt, setSentAt] = useState(0);

  const [code, setCode] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string>();

  function errorText(err: unknown, fallback: (p: { err: unknown }) => string) {
    // Not yet translated: still something to show.
    if (!am) {
      return err instanceof Error ? err.message : String(err);
    }

    switch (err instanceof HttpError ? err.status : undefined) {
      case 429:
        return am.emailCode.tooMany;
      case 403:
        return am.emailCode.wrongCode;
      // Only a confirmation may refuse a merge.
      case 409:
        return am.account.mergeConflict;
      default:
        return fallback({ err });
    }
  }

  async function send(address: string) {
    setBusy(true);

    setError(undefined);

    try {
      await httpRequest({
        getState: store.getState,
        method: 'POST',
        url:
          purpose === 'login'
            ? '/auth/email-login-code'
            : '/auth/email-change-code',
        cancelActions: [],
        expectedStatus: 204,
        data: {
          email: address,
          language: store.getState().l10n.chosenLanguage,
        },
      });

      trackMatomo(['trackEvent', 'Auth', 'sendEmailCode', purpose]);

      setSentTo(address);

      setSentAt(Date.now());

      setCode('');
    } catch (err) {
      setError(errorText(err, am?.emailCode.error ?? String));
    }

    // Not in `finally`, which makes the React Compiler skip the caller.
    setBusy(false);
  }

  async function confirm() {
    if (sentTo === undefined) {
      return;
    }

    setBusy(true);

    setError(undefined);

    try {
      await submit(sentTo, code);

      setSentTo(undefined);
    } catch (err) {
      setError(
        errorText(
          err,
          (purpose === 'login' ? am?.logInError : am?.emailCode.confirmError) ??
            String,
        ),
      );
    }

    setBusy(false);
  }

  function reset() {
    setSentTo(undefined);

    setError(undefined);
  }

  return {
    sentTo,
    sentAt,
    code,
    setCode,
    busy,
    error,
    setError,
    send,
    confirm,
    reset,
  };
}
