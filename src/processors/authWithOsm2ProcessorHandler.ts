import { authWithOsm2, authSetUser } from 'fm3/actions/authActions';
import { removeAds, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assert } from 'typia';

const handle: ProcessorHandler<typeof authWithOsm2> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { connect, code } = action.payload;

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login-osm',
    data: {
      connect,
      code,
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

  if (connect) {
    dispatch(setActiveModal('account'));
  }
};

export default handle;
