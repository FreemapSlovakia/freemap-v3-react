import { authInit, authSetUser } from 'fm3/actions/authActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { tipsNext, tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { history } from 'fm3/historyHolder';
import { setActiveModal } from 'fm3/actions/mainActions';
import { storage } from 'fm3/storage';

export const authInitProcessor: IProcessor = {
  actionCreator: authInit,
  errorKey: 'logIn.verifyError',
  handle: async ({ getState, dispatch }) => {
    try {
      dispatch(authSetUser(JSON.parse(storage.getItem('user') || '')));
    } catch (e) {
      const authToken = storage.getItem('authToken'); // for compatibility
      if (authToken) {
        dispatch(
          authSetUser({
            authToken,
            name: '...',
            email: '...',
            id: -1,
            isAdmin: false,
          }),
        );
      }
    } finally {
      storage.removeItem('authToken'); // for compatibility
    }

    const { user } = getState().auth;

    if (user) {
      const res = await httpRequest({
        getState,
        url: '/auth/validate',
        method: 'POST',
        expectedStatus: [200, 401],
      });

      dispatch(authSetUser(res.status === 200 ? res.data : null));
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
        dispatch(tipsNext(storage.getItem('tip') || null));
        dispatch(setActiveModal('tips'));
      }
    }
  },
};
