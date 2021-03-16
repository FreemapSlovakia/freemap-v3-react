import { authLoginWithOsm } from 'fm3/actions/authActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

interface LoginResponse {
  redirect: string;
}

export const authLoginWithOsmProcessor: Processor = {
  actionCreator: authLoginWithOsm,
  errorKey: 'logIn.logInError',
  handle: async ({ getState, dispatch }) => {
    // open window within user gesture gandler (before await)
    const w = window.open(
      '',
      'osm-login',
      `width=600,height=550,left=${window.screen.width / 2 - 600 / 2},top=${
        window.screen.height / 2 - 550 / 2
      }`,
    );

    if (!w) {
      dispatch(
        toastsAdd({
          id: 'logIn.enablePopup',
          style: 'warning',
          messageKey: 'logIn.enablePopup',
          timeout: 5000,
        }),
      );

      return;
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'POST',
        url: '/auth/login',
        expectedStatus: 200,
        cancelActions: [],
        data: {
          webBaseUrl: process.env['BASE_URL'],
        },
      });

      w.location.href = assertType<LoginResponse>(data).redirect;
    } catch (e) {
      w.close();

      throw e;
    }
  },
};

export default authLoginWithOsmProcessor;
