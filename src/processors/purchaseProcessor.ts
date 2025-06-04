import { assert, is } from 'typia';
import { authInit } from '../actions/authActions.js';
import { removeAds } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

type CallbackData = {
  freemap: {
    action: 'purchase';
    payload: string;
  };
};

export const purchaseProcessor: Processor = {
  actionCreator: removeAds,
  async handle({ getState, dispatch }) {
    const { user } = getState().auth;

    if (!user) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/auth/purchaseToken',
      method: 'POST',
      expectedStatus: 200,
      cancelActions: [],
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

      dispatch(authInit({ becamePremium: true }));
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
