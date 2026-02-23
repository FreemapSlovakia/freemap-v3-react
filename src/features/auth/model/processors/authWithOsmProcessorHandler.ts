import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { authWithOsm } from '../actions.js';

const handle: ProcessorHandler<typeof authWithOsm> = async ({
  action,
  dispatch,
  getState,
}) => {
  const res = await httpRequest({
    getState,
    method: 'GET',
    url: '/auth/login-osm',
    expectedStatus: 200,
  });

  const { clientId } = await res.json();

  // open window within user gesture handler (before await)
  const w = window.open(
    'https://www.openstreetmap.org/oauth2/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: location.origin + '/authCallback.html',
        scope: 'read_prefs',
        state: String(action.payload.connect),
      }).toString(),
    'osm-login',
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

export default handle;
