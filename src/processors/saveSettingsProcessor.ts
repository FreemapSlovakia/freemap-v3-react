import { httpRequest } from '@app/httpRequest.js';
import {
  applySettings,
  saveSettings,
  setActiveModal,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { bumpPictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { toastsAdd } from '@features/toasts/model/actions.js';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { settings, user, keepOpen } = action.payload;

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

      const { picture, ...userRest } = user ?? {};

      dispatch(
        authSetUser(
          Object.assign(
            {},
            getState().auth.user,
            userRest,
            picture === undefined ? null : { hasPicture: picture !== null },
          ),
        ),
      );

      if (picture !== undefined) {
        const userId = getState().auth.user?.id;

        if (userId !== undefined) {
          // Force-refresh the HTTP-cached entry before triggering a re-render,
          // so the <img> remount (keyed on pictureCacheBust) reads the new
          // bytes from cache instead of the stale ones still kept under
          // max-age=300. Best-effort — failure (incl. 404 after removal) is
          // fine since the <img> won't render anyway when hasPicture is false.
          await fetch(
            `${process.env['API_URL']}/auth/users/${userId}/picture`,
            { cache: 'reload' },
          ).catch(() => undefined);
        }

        bumpPictureCacheBust();
      }
    }

    if (settings) {
      dispatch(applySettings(settings));
    }

    window._paq.push(['trackEvent', 'Settings', 'save']);

    dispatch(
      toastsAdd({
        id: 'settings.saved',
        messageKey: 'settings.saveSuccess',
        style: 'info',
        timeout: 5000,
      }),
    );

    if (!keepOpen) {
      dispatch(setActiveModal(null));
    }
  },
};
