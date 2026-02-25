import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { authLogout, authStartLogout } from '../actions.js';

export const authLogoutProcessor: Processor = {
  actionCreator: authStartLogout,
  id: 'lcd',
  errorKey: 'auth.logOut.error',
  async handle({ dispatch, getState }) {
    try {
      FB.logout();
    } catch {
      // ignore
    }

    await httpRequest({
      getState,
      method: 'post',
      url: '/auth/logout',
      expectedStatus: [204, 401],
    });

    dispatch(authLogout());

    dispatch(
      toastsAdd({
        id: 'lcd',
        messageKey: 'auth.logOut.success',
        style: 'info',
        timeout: 5000,
      }),
    );
  },
};
