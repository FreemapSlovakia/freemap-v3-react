import { authSetUser, authWithGoogle } from 'fm3/actions/authActions';
import { removeAds, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getAuth2 } from 'fm3/gapiLoader';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { hasProperty } from 'fm3/typeUtils';
import { assert } from 'typia';

const handle: ProcessorHandler<typeof authWithGoogle> = async ({
  action,
  dispatch,
  getState,
}) => {
  try {
    await getAuth2({ scope: 'profile email' });

    const auth2 = gapi.auth2.getAuthInstance();

    const googleUser = await auth2.signIn();

    const idToken = googleUser.getAuthResponse().id_token;

    const { connect } = action.payload;

    const res = await httpRequest({
      getState,
      method: 'POST',
      url: `/auth/login-google`,
      cancelActions: [],
      expectedStatus: 200,
      data: {
        connect,
        idToken,
        language: getState().l10n.chosenLanguage,
        // homeLocation: getState().main.homeLocation,
      },
    });

    const user = assert<User>(await res.json());

    dispatch(
      toastsAdd({
        id: 'lcd',
        messageKey: connect ? 'auth.connect.success' : 'auth.logIn.success',
        style: 'info',
        timeout: 5000,
      }),
    );

    dispatch(authSetUser(user));

    if (!user.isPremium && getState().main.removeAdsOnLogin) {
      dispatch(removeAds());
    }

    if (connect) {
      dispatch(setActiveModal('account'));
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
