import { assert, is } from 'typia';
import { authInit } from '../actions/authActions.js';
import { removeAds } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

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

    const token = assert<{ token: string }>(await res.json()).token;

    const w = window.open(
      process.env['PURCHASE_URL_PREFIX'] +
        '&token=' +
        encodeURIComponent(token) +
        '&callbackurl=' +
        encodeURIComponent(process.env['BASE_URL'] + '/purchaseCallback.html'),
      'rovas',
      `width=800,height=680,left=${window.screen.width / 2 - 800 / 2},top=${
        window.screen.height / 2 - 680 / 2
      }`,
    );

    if (!w) {
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

          w.close();
        }
      };

      const timer = window.setInterval(() => {
        if (w.closed) {
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
