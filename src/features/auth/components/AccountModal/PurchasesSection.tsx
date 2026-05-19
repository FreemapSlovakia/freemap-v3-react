import {
  type Purchase,
  type PurchasesResponse,
  PurchasesResponseSchema,
} from '@features/auth/model/types.js';
import { CreditsAlert } from '@features/credits/components/CredistAlert.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useBecomePremium } from '@shared/hooks/useBecomePremium.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { JSX, type ReactElement, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import { FaExclamationTriangle, FaGem, FaShoppingBasket } from 'react-icons/fa';

export function PurchasesSection(): ReactElement | null {
  const user = useAppSelector((state) => state.auth.user);

  const m = useMessages();

  const becomePremium = useBecomePremium();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const authToken = user?.authToken;

  const [state, setState] = useState<
    | { type: 'error'; error: unknown }
    | { type: 'fetching' }
    | { type: 'success'; result: PurchasesResponse }
  >({ type: 'fetching' });

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

      setState({
        type: 'success',
        result: PurchasesResponseSchema.parse(await res.json()),
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

  return (
    <>
      {becomePremium ? (
        <Alert
          variant="warning"
          className="d-flex justify-content-between gap-4"
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
          {m?.premium.youArePremium(dateFormat.format(user.premiumExpiration!))}
        </Alert>
      )}

      {(() => {
        switch (state.type) {
          case 'fetching':
            return (
              <div className="d-flex flex-column">
                <Spinner className="align-self-center" animation="border" />
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
                    <FaShoppingBasket /> {m?.purchases.awaitingBankPayment}
                  </Alert>
                )}

                {showBankPaymentFailed && (
                  <Alert variant="danger">
                    <FaExclamationTriangle /> {m?.purchases.bankPaymentFailed}
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
                          <td>{dateFormat.format(purchase.createdAt)}</td>
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
    </>
  );
}
