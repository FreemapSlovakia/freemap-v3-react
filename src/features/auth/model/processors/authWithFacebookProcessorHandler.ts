import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadFb } from '../../../../fbLoader.js';
import { httpRequest } from '@app/httpRequest.js';
import { handleLoginResponse } from '../../loginResponseHandler.js';
import { authWithFacebook } from '../actions.js';

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
    },
  });

  await handleLoginResponse(res, getState, dispatch);
};

export default handle;
