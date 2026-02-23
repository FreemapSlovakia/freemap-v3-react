import { authWithGarmin2 } from '../actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { ProcessorHandler } from '../../../../middlewares/processorMiddleware.js';
import { handleLoginResponse } from '../../loginResponseHandler.js';

const handle: ProcessorHandler<typeof authWithGarmin2> = async ({
  getState,
  dispatch,
  action: {
    payload: { token, verifier },
  },
}) => {
  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-garmin-2',
    data: {
      token,
      verifier,
      language: getState().l10n.chosenLanguage,
    },
    expectedStatus: 200,
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
