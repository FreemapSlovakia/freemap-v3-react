import { authSetUser } from 'fm3/actions/authActions';
import { removeAds } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { loadFb } from 'fm3/fbLoader';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assertType } from 'typescript-is';

const handle: ProcessorHandler = async ({ dispatch, getState }) => {
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
          messageKey: 'logIn.logInError2',
          style: 'danger',
        }),
      );

      return;
    }
  }

  const { data } = await httpRequest({
    getState,
    method: 'POST',
    url: `/auth/login-fb`,
    cancelActions: [],
    expectedStatus: 200,
    data: {
      accessToken: response.authResponse.accessToken,
      language: getState().l10n.chosenLanguage,
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

  if (!user.isPremium && getState().main.removeAdsOnLogin) {
    dispatch(removeAds());
  }
};

export default handle;
