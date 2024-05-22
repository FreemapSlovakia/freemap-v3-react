import { authWithGarmin2, authSetUser } from 'fm3/actions/authActions';
import { removeAds } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assert } from 'typia';

const handle: ProcessorHandler<typeof authWithGarmin2> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { connect, token, verifier } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-garmin-2',
    data: {
      connect,
      token,
      verifier,
      language: getState().l10n.chosenLanguage,
      // homeLocation: getState().main.homeLocation,
    },
    expectedStatus: 200,
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
};

export default handle;
