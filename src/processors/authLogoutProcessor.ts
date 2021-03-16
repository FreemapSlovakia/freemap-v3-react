import { authLogout, authStartLogout } from 'fm3/actions/authActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const authLogoutProcessor: Processor = {
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
        id: 'login',
        messageKey: 'logOut.success',
        style: 'info',
        timeout: 5000,
      }),
    );
  },
};
