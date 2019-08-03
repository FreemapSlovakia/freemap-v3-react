import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { authSetUser, authLoginWithFacebook } from 'fm3/actions/authActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const authLoginWithFacebookProcessor: IProcessor = {
  actionCreator: authLoginWithFacebook,
  handle: async ({ dispatch, getState }) => {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const fb = window['FB'];

    let response = await new Promise<any>(resolve =>
      fb.getLoginStatus(resolve),
    );

    if (response.status !== 'connected') {
      response = await new Promise<any>(resolve => {
        fb.login(resolve, { scope: 'email' });
      });
      dispatch(stopProgress(pid));

      if (response.status !== 'connected') {
        dispatch(toastsAddError('logIn.logInError2'));
        return;
      }
    } else {
      dispatch(stopProgress(pid));
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

      dispatch(
        toastsAdd({
          collapseKey: 'login',
          messageKey: 'logIn.success',
          style: 'info',
          timeout: 5000,
        }),
      );
      dispatch(authSetUser(data));
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'logIn.logInError', err);
    }
  },
};
