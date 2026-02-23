import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { startGoogleAuth } from '../../../../gapiLoader.js';
import { httpRequest } from '@app/httpRequest.js';
import { hasProperty } from '../../../../typeUtils.js';
import { handleLoginResponse } from '../../loginResponseHandler.js';
import { authWithGoogle } from '../actions.js';

const handle: ProcessorHandler<typeof authWithGoogle> = async ({
  action,
  dispatch,
  getState,
}) => {
  try {
    const tokenResponse = await startGoogleAuth('profile email');

    if (!tokenResponse.access_token) {
      throw new Error(tokenResponse.error_description);
    }

    const res = await httpRequest({
      getState,
      method: 'POST',
      url: `/auth/login-google`,
      cancelActions: [],
      expectedStatus: 200,
      data: {
        ...action.payload,
        accessToken: tokenResponse.access_token,
        language: getState().l10n.chosenLanguage,
      },
    });

    await handleLoginResponse(res, getState, dispatch);
  } catch (err) {
    if (!hasProperty(err, 'type') || String(err['type']) !== 'popup_closed') {
      throw err;
    }
  }
};

export default handle;
