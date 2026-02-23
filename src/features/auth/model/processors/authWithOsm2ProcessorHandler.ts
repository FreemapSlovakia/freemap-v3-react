import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { httpRequest } from '@app/httpRequest.js';
import { handleLoginResponse } from '../../loginResponseHandler.js';
import { authWithOsm2 } from '../actions.js';

const handle: ProcessorHandler<typeof authWithOsm2> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { code, connect } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-osm',
    data: {
      code,
      language: getState().l10n.chosenLanguage,
      connect,
      redirectUri: location.origin + '/authCallback.html',
    },
    expectedStatus: 200,
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
