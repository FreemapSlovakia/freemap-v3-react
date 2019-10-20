import { Processor } from 'fm3/middlewares/processorMiddleware';
import { authLoginWithOsm } from 'fm3/actions/authActions';
import { httpRequest } from 'fm3/authAxios';
import { assertType } from 'typescript-is';

interface LoginResponse {
  redirect: string;
}

export const authLoginWithOsmProcessor: Processor = {
  actionCreator: authLoginWithOsm,
  errorKey: 'logIn.logInError',
  handle: async ({ getState }) => {
    // open window within user gesture gandler (before await)
    const w = window.open(
      '',
      'osm-login',
      `width=600,height=550,left=${window.screen.width / 2 -
        600 / 2},top=${window.screen.height / 2 - 550 / 2}`,
    );

    if (!w) {
      throw new Error('window is null');
    }

    try {
      const { data } = await httpRequest({
        getState,
        method: 'POST',
        url: '/auth/login',
        expectedStatus: 200,
        cancelActions: [],
      });

      w.location.href = assertType<LoginResponse>(data).redirect;
    } catch (e) {
      w.close();
      throw e;
    }
  },
};
