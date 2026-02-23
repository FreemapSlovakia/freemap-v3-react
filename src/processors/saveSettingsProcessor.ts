import { authSetUser } from '../features/auth/model/actions.js';
import {
  applySettings,
  saveSettings,
  setActiveModal,
} from '../actions/mainActions.js';
import { toastsAdd } from '../features/toasts/model/actions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { settings, user } = action.payload;

    if (getState().auth.user) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        cancelActions: [setActiveModal, saveSettings],
        data: {
          ...user,
          settings,
        },
      });

      dispatch(authSetUser(Object.assign({}, getState().auth.user, user)));
    }

    if (settings) {
      dispatch(applySettings(settings));
    }

    window._paq.push(['trackEvent', 'Main', 'saveSettings']);

    dispatch(
      toastsAdd({
        id: 'settings.saved',
        messageKey: 'settings.saveSuccess',
        style: 'info',
        timeout: 5000,
      }),
    );

    dispatch(setActiveModal(null));
  },
};
