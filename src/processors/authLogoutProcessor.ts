import { toastsAdd } from 'fm3/actions/toastsActions';
import { authLogout, authStartLogout } from 'fm3/actions/authActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const authLogoutProcessor: IProcessor = {
  actionCreator: authStartLogout,
  errorKey: 'logIn.logOutError',
  handle: async ({ dispatch, getState }) => {
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
  },
};
