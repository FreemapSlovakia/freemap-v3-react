import { toastsAdd } from 'fm3/actions/toastsActions';
import { authSetUser, authLoginWithGoogle } from 'fm3/actions/authActions';
import { getAuth2 } from 'fm3/gapiLoader';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';
import { User } from 'fm3/types/common';

export const authLoginWithGoogleProcessor: Processor = {
  actionCreator: authLoginWithGoogle,
  errorKey: 'logIn.logInError',
  handle: async ({ dispatch, getState }) => {
    try {
      const [auth2] = await getAuth2();
      const googleUser = await auth2.signIn();
      const idToken = googleUser.getAuthResponse().id_token;

      const { data } = await httpRequest({
        getState,
        method: 'POST',
        url: `/auth/login-google`,
        cancelActions: [],
        expectedStatus: 200,
        data: { idToken },
      });

      const user = assertType<User>(data);

      dispatch(
        toastsAdd({
          collapseKey: 'login',
          messageKey: 'logIn.success',
          style: 'info',
          timeout: 5000,
        }),
      );

      dispatch(authSetUser(user));
    } catch (err) {
      if (!['popup_closed_by_user', 'access_denied'].includes(err.error)) {
        throw err;
      }
    }
  },
};
