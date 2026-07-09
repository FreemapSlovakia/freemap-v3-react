import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { popupOAuthProviders } from '../../popupOAuthProviders.js';
import type { authWithOAuthCode } from '../actions.js';
import { handleLoginResponse } from './loginResponseHandler.js';

const handle: ProcessorHandler<typeof authWithOAuthCode> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { provider, code, connect, successAction } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: popupOAuthProviders[provider].loginPath,
    data: {
      code,
      language: getState().l10n.chosenLanguage,
      connect,
      redirectUri: `${location.origin}/authCallback.html`,
    },
    expectedStatus: 200,
  });

  await handleLoginResponse(res, getState, dispatch);

  // Runs after handleLoginResponse, so it overrides its default modal switch
  // (e.g. the connect flow's jump to the account modal).
  if (successAction) {
    dispatch(successAction);
  }
};

export default handle;
