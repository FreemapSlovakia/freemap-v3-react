import { httpRequest } from '@app/httpRequest.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authInit } from '@features/auth/model/actions.js';
import { purchaseOnLogin } from '@features/auth/model/purchaseActions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { assert } from 'typia';

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

      dispatch(setActiveModal('login'));

      return;
    }

    window._paq.push([
      'trackEvent',
      'Purchase',
      'purchaseStart',
      JSON.stringify(action.payload),
    ]);

    const res = await httpRequest({
      getState,
      url: '/auth/purchaseToken',
      method: 'POST',
      expectedStatus: 200,
      cancelActions: [],
      data: {
        callbackUrl: location.origin + '/purchaseCallback.html',
        ...action.payload,
      },
    });

    const { paymentUrl } = assert<{ paymentUrl: string }>(await res.json());

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
          color: 'yellow',
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
        'purchaseSuccess',
        JSON.stringify(action.payload),
      ]);

      // refresh user data
      dispatch(authInit());

      if (callbackResult.pendingBankTransfer) {
        dispatch(
          toastsAdd({
            color: 'cyan',
            messageKey: 'purchases.awaitingBankPayment',
          }),
        );

        return;
      }

      const purchase = action.payload;

      switch (purchase.type) {
        case 'premium':
          dispatch(
            toastsAdd({
              color: 'green',
              messageKey: 'premium.success',
            }),
          );

          break;
        case 'credits':
          dispatch(
            toastsAdd({
              color: 'green',
              messageKey: 'credits.purchase.success',
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
          color: 'red',
          messageKey: 'general.operationError',
          messageParams: { err },
        }),
      );
    }
  },
};
