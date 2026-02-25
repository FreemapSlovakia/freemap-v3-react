import { httpRequest } from '@app/httpRequest.js';
import { purchase, setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authInit } from '@features/auth/model/actions.js';
import { purchaseOnLogin } from '@features/auth/model/purchaseActions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { assert, is } from 'typia';

type CallbackData = {
  freemap: {
    action: 'purchase';
    payload: string;
  };
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
          style: 'warning',
          messageKey: 'general.enablePopup',
          timeout: 5000,
        }),
      );

      return;
    }

    const callbackResultPromise = new Promise<boolean>((resolve) => {
      const msgListener = (e: MessageEvent) => {
        const { data } = e;

        if (e.origin === window.location.origin && is<CallbackData>(data)) {
          const sp = new URLSearchParams(data.freemap.payload);

          const error = sp.get('error');

          if (error) {
            throw new Error(error);
          }

          resolve(true);

          windowProxy.close();
        }
      };

      const timer = window.setInterval(() => {
        if (windowProxy.closed) {
          window.clearInterval(timer);

          window.removeEventListener('message', msgListener);

          resolve(false);
        }
      }, 500);

      window.addEventListener('message', msgListener);
    });

    try {
      if (!(await callbackResultPromise)) {
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

      const purchase = action.payload;

      switch (purchase.type) {
        case 'premium':
          dispatch(
            toastsAdd({
              style: 'success',
              messageKey: 'premium.success',
            }),
          );

          break;
        case 'credits':
          dispatch(
            toastsAdd({
              style: 'success',
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
