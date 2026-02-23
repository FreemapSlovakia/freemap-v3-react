import { authDisconnect, authSetUser } from '../actions.js';
import { toastsAdd } from '../../../toasts/model/actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { ProcessorHandler } from '../../../../middlewares/processorMiddleware.js';

const handle: ProcessorHandler<typeof authDisconnect> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider } = action.payload;

  await httpRequest({
    getState,
    method: 'DELETE',
    url: '/auth/providers/' + provider,
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
      messageKey: 'auth.disconnect.success',
      messageParams: { provider },
      style: 'info',
    }),
  );
};

export default handle;
