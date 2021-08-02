import { authLoginWithOsm2, authSetUser } from 'fm3/actions/authActions';
import { removeAds, setHomeLocation } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assertType } from 'typescript-is';

const handle: ProcessorHandler<typeof authLoginWithOsm2> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { data } = await httpRequest({
    getState,
    method: 'POST',
    url: '/auth/login2',
    data: {
      ...action.payload,
      language: getState().l10n.chosenLanguage,
      preventTips: getState().tips.preventTips,
      // homeLocation: getState().main.homeLocation,
    },
    expectedStatus: 200,
  });

  const user = assertType<User>(data);

  if (!getState().main.homeLocation && user.lat != null && user.lon != null) {
    dispatch(setHomeLocation({ lat: user.lat, lon: user.lon }));
  }

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
