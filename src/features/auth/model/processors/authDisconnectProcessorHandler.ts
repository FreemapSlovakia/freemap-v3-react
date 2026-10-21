import { httpRequest } from '@app/httpRequest.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { type authDisconnect, authSetUser } from '../actions.js';
import { UserSchema } from '../types.js';

const handle: ProcessorHandler<typeof authDisconnect> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'DELETE',
    url: `/auth/providers/${provider}`,
    expectedStatus: [204, 409],
  });

  // The account's last provider, though this tab showed another one: it was
  // disconnected elsewhere, so the list is read again.
  if (res.status === 409) {
    dispatch(
      toastsAdd({
        id: 'lcd',
        style: 'warning',
        messageKey: 'lastProvider',
        messageLoader: loadAuthMessages,
      }),
    );

    const current = UserSchema.pick({
      authProviders: true,
      osmGpxAuthorized: true,
    }).parse(
      await (
        await httpRequest({
          getState,
          url: '/auth/validate',
          method: 'POST',
          expectedStatus: 200,
        })
      ).json(),
    );

    const { user } = getState().auth;

    if (user) {
      dispatch(authSetUser({ ...user, ...current }));
    }

    return;
  }

  const { user } = getState().auth;

  dispatch(
    authSetUser(
      user && {
        ...user,
        authProviders: user.authProviders.filter((p) => p !== provider),
        // The API forgets the OSM token along with the OSM identity.
        osmGpxAuthorized: provider !== 'osm' && user.osmGpxAuthorized,
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
