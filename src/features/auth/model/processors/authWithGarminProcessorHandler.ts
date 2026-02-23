import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { assert } from 'typia';
import { httpRequest } from '@app/httpRequest.js';
import { authWithGarmin } from '../actions.js';

export const handle: ProcessorHandler<typeof authWithGarmin> = async ({
  action: {
    payload: { connect, successAction },
  },
  getState,
  dispatch,
}) => {
  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-garmin',
    data: {
      connect,
      callbackUrl: location.origin + '/garminAuthCallback.html',
      clientData: {
        successAction,
      },
    },
    expectedStatus: 200,
  });

  const { redirectUrl } = assert<{ redirectUrl: string }>(await res.json());

  const w = window.open(
    redirectUrl,
    'garmin-login',
    `width=600,height=550,left=${window.screen.width / 2 - 600 / 2},top=${
      window.screen.height / 2 - 550 / 2
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

  await new Promise<void>((resolve) => {
    const ref = window.setInterval(() => {
      if (w.closed) {
        window.clearInterval(ref);

        resolve();
      }
    });
  });
};
