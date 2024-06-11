import { authWithGoogle } from 'fm3/actions/authActions';
import { getAuth2 } from 'fm3/gapiLoader';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { hasProperty } from 'fm3/typeUtils';
import { handleLoginResponse } from './loginResponseHandler';

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

    await handleLoginResponse(res, getState, dispatch);
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
