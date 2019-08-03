import { toastsAdd } from 'fm3/actions/toastsActions';
import { authLogout, authStartLogout } from 'fm3/actions/authActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { dispatchAxiosErrorAsToast } from './utils';
import { httpRequest } from 'fm3/authAxios';

export const authLogoutProcessor: IProcessor = {
  actionCreator: authStartLogout,
  handle: async ({ dispatch, getState }) => {
    try {
      await httpRequest({
        getState,
        method: 'post',
        url: '/auth/logout',
        expectedStatus: [204, 401],
      });

      dispatch(authLogout());
      dispatch(
        toastsAdd({
          collapseKey: 'login',
          messageKey: 'logOut.success',
          style: 'info',
          timeout: 5000,
        }),
      );
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'logIn.logOutError', err);
    }
  },
};
