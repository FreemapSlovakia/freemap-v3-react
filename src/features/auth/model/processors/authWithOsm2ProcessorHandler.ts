import { authWithOsm2 } from '../actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { ProcessorHandler } from '../../../../middlewares/processorMiddleware.js';
import { handleLoginResponse } from '../../loginResponseHandler.js';

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
