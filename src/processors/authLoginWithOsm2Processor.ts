import { Processor } from 'fm3/middlewares/processorMiddleware';
import { authLoginWithOsm2, authSetUser } from 'fm3/actions/authActions';
import { httpRequest } from 'fm3/authAxios';
import { setHomeLocation } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { assertType } from 'typescript-is';

export const authLoginWithOsm2Processor: Processor<typeof authLoginWithOsm2> = {
  actionCreator: authLoginWithOsm2,
  errorKey: 'logIn.logInError',
  handle: async ({ getState, dispatch, action }) => {
    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: '/auth/login2',
      data: action.payload,
      expectedStatus: 200,
    });

    const okData = assertType<User>(data);

    if (!getState().main.homeLocation) {
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
