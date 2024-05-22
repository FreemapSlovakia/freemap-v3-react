import { authDisconnect, authSetUser } from 'fm3/actions/authActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';

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
