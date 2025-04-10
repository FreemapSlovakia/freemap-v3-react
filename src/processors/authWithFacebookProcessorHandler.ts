import { authWithFacebook } from '../actions/authActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { loadFb } from '../fbLoader.js';
import { httpRequest } from '../httpRequest.js';
import { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import { handleLoginResponse } from './loginResponseHandler.js';

const handle: ProcessorHandler<typeof authWithFacebook> = async ({
  action,
  dispatch,
  getState,
}) => {
  await loadFb();

  let response = await new Promise<fb.StatusResponse>((resolve) =>
    FB.getLoginStatus(resolve, true),
  );

  if (response.status !== 'connected') {
    response = await new Promise<fb.StatusResponse>((resolve) => {
      FB.login(resolve, { scope: 'email' });
    });

    if (response.status !== 'connected') {
      dispatch(
        toastsAdd({
          messageKey: 'auth.logIn.logInError2',
          style: 'danger',
        }),
      );

      return;
    }
  }

  const { connect } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: `/auth/login-fb`,
    cancelActions: [],
    expectedStatus: 200,
    data: {
      connect,
      accessToken: response.authResponse.accessToken,
      language: getState().l10n.chosenLanguage,
      // homeLocation: getState().main.homeLocation,
    },
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
