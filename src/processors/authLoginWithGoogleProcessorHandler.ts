import { authSetUser } from 'fm3/actions/authActions';
import { removeAds } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getAuth2 } from 'fm3/gapiLoader';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { hasProperty } from 'fm3/typeUtils';
import { assertType } from 'typescript-is';

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
  try {
    await getAuth2({ scope: 'profile email' });

    const auth2 = gapi.auth2.getAuthInstance();

    const googleUser = await auth2.signIn();

    const idToken = googleUser.getAuthResponse().id_token;

    const res = await httpRequest({
      getState,
      method: 'POST',
      url: `/auth/login-google`,
      cancelActions: [],
      expectedStatus: 200,
      data: {
        idToken,
        language: getState().l10n.chosenLanguage,
        // homeLocation: getState().main.homeLocation,
      },
    });

    const user = assertType<User>(await res.json());

    dispatch(
      toastsAdd({
        id: 'login',
        messageKey: 'logIn.success',
        style: 'info',
        timeout: 5000,
      }),
    );

    dispatch(authSetUser(user));

    if (!user.isPremium && getState().main.removeAdsOnLogin) {
      dispatch(removeAds());
    }
  } catch (err) {
    if (
      !hasProperty(err, 'error') ||
      !['popup_closed_by_user', 'access_denied'].includes(String(err['error']))
    ) {
      throw err;
    }
  }
};

export default handle;
