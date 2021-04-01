import { authLoginWithOsm2, authSetUser } from 'fm3/actions/authActions';
import { setHomeLocation } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const authLoginWithOsm2Processor: Processor<typeof authLoginWithOsm2> = {
  actionCreator: authLoginWithOsm2,
  errorKey: 'logIn.logInError',
  handle: async ({ getState, dispatch, action }) => {
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

    const okData = assertType<User>(data);

    if (
      !getState().main.homeLocation &&
      typeof okData.lat === 'number' &&
      typeof okData.lon === 'number'
    ) {
      dispatch(setHomeLocation({ lat: okData.lat, lon: okData.lon }));
    }

    dispatch(
      toastsAdd({
        id: 'login',
        messageKey: 'logIn.success',
        style: 'info',
        timeout: 5000,
      }),
    );

    dispatch(authSetUser(okData));
  },
};

export default authLoginWithOsm2Processor;
