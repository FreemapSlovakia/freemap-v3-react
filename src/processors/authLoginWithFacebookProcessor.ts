import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser, authLoginWithFacebook } from 'fm3/actions/authActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';
import { IUser } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const authLoginWithFacebookProcessor: IProcessor = {
  actionCreator: authLoginWithFacebook,
  handle: async ({ dispatch, getState }) => {
    let response = await new Promise<fb.StatusResponse>(resolve =>
      FB.getLoginStatus(resolve),
    );

    if (response.status !== 'connected') {
      response = await new Promise<fb.StatusResponse>(resolve => {
        FB.login(resolve, { scope: 'email' });
      });

      if (response.status !== 'connected') {
        dispatch(toastsAddError('logIn.logInError2'));
        return;
      }
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'POST',
        url: `/auth/login-fb`,
        cancelActions: [],
        expectedStatus: 200,
        data: { accessToken: response.authResponse.accessToken },
      });

      const user = assertType<IUser>(data);

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
      dispatchAxiosErrorAsToast(dispatch, 'logIn.logInError', err);
    }
  },
};
