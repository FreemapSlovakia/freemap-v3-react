import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadAuthMessages } from '../../translations/loadAuthMessages.js';
import { authLogout, authStartLogout } from '../actions.js';

export const authLogoutProcessor: Processor = {
  actionCreator: authStartLogout,
  async handle({ dispatch, getState, toastError }) {
    try {
      window._paq.push(['trackEvent', 'Auth', 'logout']);

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
          messageKey: 'logOutSuccess',
          messageLoader: loadAuthMessages,
          style: 'info',
          timeout: 5000,
        }),
      );
    } catch (err) {
      await toastError(err, loadAuthMessages, 'logOutError', 'lcd');
    }
  },
};
