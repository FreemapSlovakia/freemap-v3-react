import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { type authDisconnect, authSetUser } from '../actions.js';

const handle: ProcessorHandler<typeof authDisconnect> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider } = action.payload;

  await httpRequest({
    getState,
    method: 'DELETE',
    url: `/auth/providers/${provider}`,
    expectedStatus: 204,
  });

  const { user } = getState().auth;

  dispatch(
    authSetUser(
      user && {
        ...user,
        authProviders: user.authProviders.filter((p) => p !== provider),
      },
    ),
  );

  dispatch(
    toastsAdd({
      messageKey: 'disconnectSuccess',
      messageLoader: loadAuthMessages,
      style: 'info',
    }),
  );
};

export default handle;
