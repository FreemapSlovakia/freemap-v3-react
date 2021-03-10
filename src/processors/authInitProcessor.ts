import { authInit, authSetUser } from 'fm3/actions/authActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsPreventNextTime, tipsShow } from 'fm3/actions/tipsActions';
import { httpRequest } from 'fm3/authAxios';
import { history } from 'fm3/historyHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { storage } from 'fm3/storage';
import { User } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const authInitProcessor: Processor = {
  actionCreator: authInit,
  errorKey: 'logIn.verifyError',
  handle: async ({ getState, dispatch }) => {
    try {
      const user = JSON.parse(storage.getItem('user') ?? '');

      dispatch(authSetUser({ ...user, notValidated: true }));
    } catch (e) {
      // ignore JSON parsing error
    }

    const { user } = getState().auth;

    if (user) {
      const res = await httpRequest({
        getState,
        url: '/auth/validate',
        method: 'POST',
        expectedStatus: [200, 401],
        cancelActions: [],
      });

      dispatch(
        authSetUser(res.status === 200 ? assertType<User>(res.data) : null),
      );
    }

    // show tips only if not embedded and there are no other query parameters except 'map' or 'layers'
    if (
      window.self === window.top &&
      history.location.search
        .substring(1)
        .split('&')
        .every((x: string) => /^(map|layers)=|^$/.test(x))
    ) {
      if (!getState().auth.user) {
        dispatch(
          tipsPreventNextTime(storage.getItem('preventTips') === 'true'),
        );
      }

      if (
        !getState().tips.preventTips &&
        ['sk', 'cs'].includes(getState().l10n.language)
      ) {
        dispatch(tipsShow(storage.getItem('tip') || 'freemap'));

        dispatch(setActiveModal('tips'));
      }
    }
  },
};
