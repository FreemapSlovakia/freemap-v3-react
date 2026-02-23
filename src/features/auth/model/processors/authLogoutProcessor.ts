import { authLogout, authStartLogout } from '../actions.js';
import { toastsAdd } from '../../../toasts/model/actions.js';
import { httpRequest } from '../../../../httpRequest.js';
import type { Processor } from '../../../../middlewares/processorMiddleware.js';

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
