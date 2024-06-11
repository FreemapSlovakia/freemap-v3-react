import { authWithOsm } from 'fm3/actions/authActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';

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
        redirect_uri: process.env['BASE_URL'] + '/authCallback.html',
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
