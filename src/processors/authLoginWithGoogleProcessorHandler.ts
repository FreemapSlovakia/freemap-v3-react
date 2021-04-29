import { authSetUser } from 'fm3/actions/authActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { getAuth2 } from 'fm3/gapiLoader';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assertType } from 'typescript-is';

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
  try {
    await getAuth2({ scope: 'profile email' });

    const auth2 = gapi.auth2.getAuthInstance();

    const googleUser = await auth2.signIn();

    const idToken = googleUser.getAuthResponse().id_token;

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: `/auth/login-google`,
      cancelActions: [],
      expectedStatus: 200,
      data: {
        idToken,
        language: getState().l10n.chosenLanguage,
        preventTips: getState().tips.preventTips,
        // homeLocation: getState().main.homeLocation,
      },
    });

    const user = assertType<User>(data);

    dispatch(
      toastsAdd({
        id: 'login',
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
};

export default handle;
