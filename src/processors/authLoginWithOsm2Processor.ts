import { Processor } from 'fm3/middlewares/processorMiddleware';
import { authLoginWithOsm2, authSetUser } from 'fm3/actions/authActions';
import { httpRequest } from 'fm3/authAxios';
import { setHomeLocation } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

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

    if (!getState().main.homeLocation) {
      dispatch(setHomeLocation({ lat: data.lat, lon: data.lon }));
    }

    dispatch(
      toastsAdd({
        collapseKey: 'login',
        messageKey: 'logIn.success',
        style: 'info',
        timeout: 5000,
      }),
    );

    dispatch(authSetUser(data));
  },
};
