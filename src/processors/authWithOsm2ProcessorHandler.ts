import { authWithOsm2 } from 'fm3/actions/authActions';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { handleLoginResponse } from './loginResponseHandler';

const handle: ProcessorHandler<typeof authWithOsm2> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { code } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-osm',
    data: {
      code,
      language: getState().l10n.chosenLanguage,
      // homeLocation: getState().main.homeLocation,
    },
    expectedStatus: 200,
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
