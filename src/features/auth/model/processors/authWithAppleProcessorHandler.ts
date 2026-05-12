import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { hasProperty } from '@shared/types/typeUtils.js';
import { authWithApple } from '../actions.js';
import { handleLoginResponse } from './loginResponseHandler.js';

const APPLE_SERVICE_ID = 'sk.freemap.service';

const APPLE_REDIRECT_URI = 'https://backend.freemap.sk/auth/apple-callback';

const APPLE_CALLBACK_ORIGIN = 'https://backend.freemap.sk';

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';

const handle: ProcessorHandler<typeof authWithApple> = async ({
  action,
  dispatch,
  getState,
}) => {
  const state = crypto.randomUUID();

  const authUrl = `${APPLE_AUTH_URL}?${new URLSearchParams({
    client_id: APPLE_SERVICE_ID,
    redirect_uri: APPLE_REDIRECT_URI,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state,
  }).toString()}`;

  const width = 500;

  const height = 700;

  const left = window.screenX + (window.outerWidth - width) / 2;

  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    'apple-signin',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
  );

  if (!popup) {
    throw new Error('Popup blocked');
  }

  let response: URLSearchParams;

  try {
    response = await new Promise<URLSearchParams>((resolve, reject) => {
      const cleanup = () => {
        clearInterval(closedCheck);
        window.removeEventListener('message', onMessage);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== APPLE_CALLBACK_ORIGIN) {
          return;
        }

        if (typeof event.data !== 'string' || !event.data.startsWith('?')) {
          return;
        }

        const params = new URLSearchParams(event.data.slice(1));

        if (params.get('state') !== state) {
          cleanup();

          reject(new Error('Apple state mismatch'));

          return;
        }

        cleanup();

        resolve(params);
      };

      const closedCheck = window.setInterval(() => {
        if (popup.closed) {
          cleanup();

          reject(Object.assign(new Error('Popup closed'), { type: 'popup_closed' }));
        }
      }, 500);

      window.addEventListener('message', onMessage);
    });
  } catch (err) {
    if (hasProperty(err, 'type') && String(err['type']) === 'popup_closed') {
      return;
    }

    throw err;
  }

  const errorCode = response.get('error');

  if (errorCode) {
    throw new Error(`Apple auth error: ${errorCode}`);
  }

  const identityToken = response.get('id_token');

  if (!identityToken) {
    throw new Error('Apple did not return id_token');
  }

  let name: string | undefined;

  const userJson = response.get('user');

  if (userJson) {
    try {
      const user = JSON.parse(userJson) as {
        name?: { firstName?: string; lastName?: string };
      };

      const firstName = user.name?.firstName ?? '';

      const lastName = user.name?.lastName ?? '';

      name = `${firstName} ${lastName}`.trim() || undefined;
    } catch {
      // ignore malformed user payload
    }
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-apple',
    cancelActions: [],
    expectedStatus: 200,
    data: {
      identityToken,
      name,
      connect: action.payload.connect,
      language: getState().l10n.chosenLanguage,
    },
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
