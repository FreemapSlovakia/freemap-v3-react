import { httpRequest } from '@app/httpRequest.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authInit } from '@features/auth/model/actions.js';
import { purchaseOnLogin } from '@features/auth/model/purchaseActions.js';
import { loadCreditsMessages } from '@features/credits/translations/loadCreditsMessages.js';
import { loadPremiumMessages } from '@features/premium/translations/loadPremiumMessages.js';
import { loadPurchasesMessages } from '@features/purchases/translations/loadPurchasesMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed';
import { isBroadcastChannelSupported } from '@shared/broadcastChannelSupport.js';
import z from 'zod';

type CallbackResult = {
  success: boolean;
  pendingBankTransfer: boolean;
};

export const purchaseProcessor: Processor<typeof purchase> = {
  actionCreator: purchase,
  async handle({ getState, dispatch, action }) {
    const { user } = getState().auth;

    if (!user) {
      dispatch(purchaseOnLogin(action.payload));

      dispatch(setActiveModal({ type: 'login' }));

      return;
    }

    if (!isBroadcastChannelSupported()) {
      // The payment popup relays its result back over a BroadcastChannel;
      // without it the purchase could never complete. Warn instead of opening a
      // dead popup.
      dispatch(
        toastsAdd({
          id: 'broadcastChannelUnsupported',
          style: 'danger',
          messageKey: 'general.broadcastChannelUnsupported',
          timeout: 5000,
        }),
      );

      return;
    }

    window._paq.push([
      'trackEvent',
      'Purchase',
      'start',
      action.payload.type,
      action.payload.type === 'credits' ? action.payload.amount : undefined,
    ]);

    // Polar flow — opens an embedded checkout overlay. Users can still
    // explicitly choose Rovas (to pay with chrons), which falls through to the
    // legacy flow below.
    if (action.payload.via !== 'rovas') {
      // Active UI language so the Polar checkout renders in the same language.
      const lang = getState().l10n.language ?? undefined;

      const data =
        action.payload.type === 'premium'
          ? {
              type: 'premium' as const,
              recurring: Boolean(action.payload.recurring),
              successUrl: location.origin + '/',
              lang,
            }
          : {
              type: 'credits' as const,
              credits: action.payload.amount,
              successUrl: location.origin + '/',
              lang,
            };

      let checkoutUrl: string;

      try {
        const res = await httpRequest({
          getState,
          url: '/auth/polar/checkout',
          method: 'POST',
          expectedStatus: 200,
          cancelActions: [],
          data,
        });

        checkoutUrl = z
          .object({ checkoutUrl: z.string() })
          .parse(await res.json()).checkoutUrl;
      } catch (err) {
        console.error(err);

        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.operationError',
            messageParams: { err },
          }),
        );

        return;
      }

      const theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      let succeeded = false;

      try {
        const checkout = await PolarEmbedCheckout.create(checkoutUrl, {
          theme,
        });

        await new Promise<void>((resolve) => {
          checkout.addEventListener('success', (e) => {
            // Keep the user in the app instead of redirecting to successUrl.
            e.preventDefault();

            succeeded = true;

            checkout.close();

            // `close()` removes the iframe but does NOT emit a `close` event, so
            // resolve here — otherwise the processor would hang forever.
            resolve();
          });

          // Fires when the user dismisses the checkout without completing it.
          checkout.addEventListener('close', () => resolve());
        });
      } catch (err) {
        console.error(err);

        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.operationError',
            messageParams: { err },
          }),
        );

        return;
      }

      if (!succeeded) {
        return; // closed without completing payment
      }

      window._paq.push([
        'trackEvent',
        'Purchase',
        'success',
        action.payload.type,
        action.payload.type === 'credits' ? action.payload.amount : undefined,
      ]);

      // The webhook is the source of truth and is processed asynchronously, so
      // refresh now and once more shortly after in case it hasn't landed yet.
      dispatch(authInit());

      setTimeout(() => dispatch(authInit()), 2500);

      if (action.payload.type === 'premium') {
        dispatch(
          toastsAdd({
            style: 'success',
            messageKey: 'success',
            messageLoader: loadPremiumMessages,
          }),
        );
      } else {
        dispatch(
          toastsAdd({
            style: 'success',
            messageKey: 'purchase.success',
            messageLoader: loadCreditsMessages,
            messageParams: { amount: action.payload.amount },
          }),
        );

        dispatch(setActiveModal(null));
      }

      return;
    }

    // `via` is a client-only provider selector; the legacy Rovas endpoint has a
    // strict schema, so strip it before sending.
    const { via: _via, ...rovasPayload } = action.payload;

    const res = await httpRequest({
      getState,
      url: '/auth/purchaseToken',
      method: 'POST',
      expectedStatus: 200,
      cancelActions: [],
      data: {
        callbackUrl: location.origin + '/purchaseCallback.html',
        ...rovasPayload,
      },
    });

    const { paymentUrl } = z
      .object({ paymentUrl: z.string() })
      .parse(await res.json());

    const left = window.screen.width / 2 - 800 / 2;

    const top = window.screen.height / 2 - 680 / 2;

    const windowProxy = window.open(
      paymentUrl,
      'rovas',
      `width=800,height=680,left=${left},top=${top}`,
    );

    if (!windowProxy) {
      dispatch(
        toastsAdd({
          id: 'enablePopup',
          style: 'warning',
          messageKey: 'general.enablePopup',
          timeout: 5000,
        }),
      );

      return;
    }

    const callbackResultPromise = new Promise<CallbackResult>(
      (resolve, reject) => {
        const bc = new BroadcastChannel('freemap-purchase');

        const closedInterval = setInterval(() => {
          if (windowProxy.closed) {
            clearInterval(closedInterval);

            bc.close();

            reject(new Error('popup closed'));
          }
        }, 500);

        bc.onmessage = (e) => {
          clearInterval(closedInterval);

          bc.postMessage({ ok: true });

          bc.close();

          const sp = new URLSearchParams(e.data.search);

          const error = sp.get('error');

          if (error) {
            reject(new Error(error));

            return;
          }

          const pendingBankTransfer =
            sp.has('token') &&
            sp.has('signature') &&
            sp.get('currency') === 'EUR' &&
            sp.has('amount_paid');

          resolve({ success: true, pendingBankTransfer });
        };
      },
    );

    try {
      const callbackResult = await callbackResultPromise;

      if (!callbackResult.success) {
        return;
      }

      window._paq.push([
        'trackEvent',
        'Purchase',
        'success',
        action.payload.type,
        action.payload.type === 'credits' ? action.payload.amount : undefined,
      ]);

      // refresh user data
      dispatch(authInit());

      if (callbackResult.pendingBankTransfer) {
        dispatch(
          toastsAdd({
            style: 'info',
            messageKey: 'awaitingBankPayment',
            messageLoader: loadPurchasesMessages,
          }),
        );

        return;
      }

      const purchase = action.payload;

      switch (purchase.type) {
        case 'premium':
          dispatch(
            toastsAdd({
              style: 'success',
              messageKey: 'success',
              messageLoader: loadPremiumMessages,
            }),
          );

          break;
        case 'credits':
          dispatch(
            toastsAdd({
              style: 'success',
              messageKey: 'purchase.success',
              messageLoader: loadCreditsMessages,
              messageParams: {
                amount: purchase.amount,
              },
            }),
          );

          dispatch(setActiveModal(null));

          break;
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'popup closed') {
        return;
      }

      console.error(err);

      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'general.operationError',
          messageParams: { err },
        }),
      );
    }
  },
};
