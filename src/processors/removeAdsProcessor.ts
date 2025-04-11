import { assert } from 'typia';
import { authSetPremium } from '../actions/authActions.js';
import { removeAds } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

type Response = {
  rovasToken: string;
};

export const removeAdsProcessor: Processor = {
  actionCreator: removeAds,
  async handle({ getState, dispatch }) {
    const userId = getState().auth.user?.id;

    if (userId == null) {
      return;
    }

    const res = await httpRequest({
      getState,
      url: '/auth/rovasToken',
      method: 'POST',
      expectedStatus: 200,
      cancelActions: [],
    });

    const { rovasToken } = assert<Response>(await res.json());

    const w = window.open(
      process.env['ROVAS_URL_PREFIX'] +
        '&callbackurl=' +
        encodeURIComponent(
          process.env['BASE_URL'] +
            `/rovasCallback.html?token=${encodeURIComponent(rovasToken)}`,
        ),
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

    const p = new Promise<{ token: string; signature: string } | void>(
      (resolve) => {
        const msgListener = (e: MessageEvent) => {
          if (
            e.origin === window.location.origin &&
            typeof e.data === 'object' &&
            typeof e.data?.freemap === 'object' &&
            e.data.freemap.action === 'rovasPayment'
          ) {
            const sp = new URLSearchParams(e.data.freemap.payload);

            const token = sp.get('token');

            const outcome = sp.get('outcome');

            if (typeof token !== 'string' || typeof outcome !== 'string') {
              throw new Error();
            }

            resolve({ token, signature: outcome });

            w.close();
          }
        };

        const timer = window.setInterval(() => {
          if (w.closed) {
            window.clearInterval(timer);

            window.removeEventListener('message', msgListener);

            resolve();
          }
        }, 500);

        window.addEventListener('message', msgListener);
      },
    );

    try {
      const result = await p; // TODO catch error -> toast

      if (result === undefined) {
        return;
      }

      const resp = await httpRequest({
        getState,
        url: '/auth/rovasValidate',
        method: 'POST',
        data: {
          // token: result.token, // we don't need this for the proof
          signature: result.signature,
        },
        expectedStatus: [204, 404],
        cancelActions: [],
      });

      if (resp.status !== 204) {
        throw new Error('HTTP status ' + resp.status);
      }

      dispatch(
        toastsAdd({
          style: 'success',
          messageKey: 'premium.success',
          timeout: 5000,
        }),
      );

      dispatch(authSetPremium());
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
