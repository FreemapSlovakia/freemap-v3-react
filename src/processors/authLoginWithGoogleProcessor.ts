import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { authSetUser, authLoginWithGoogle } from 'fm3/actions/authActions';
import { getAuth2 } from 'fm3/gapiLoader';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const authLoginWithGoogleProcessor: IProcessor = {
  actionCreator: authLoginWithGoogle,
  handle: async ({ dispatch, getState }) => {
    const pid = Math.random();
    dispatch(startProgress(pid));

    try {
      const auth2: gapi.auth2.GoogleAuth = await (getAuth2 as any)();
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
      if (!['popup_closed_by_user', 'access_denied'].includes(err.error)) {
        dispatchAxiosErrorAsToast(dispatch, 'logIn.logInError', err);
      }
    } finally {
      dispatch(stopProgress(pid));
    }
  },
};
