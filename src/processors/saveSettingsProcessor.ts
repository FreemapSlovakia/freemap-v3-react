import {
  applySettings,
  saveSettings,
  setActiveModal,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  patchAccountSettings,
  queueSettingsSave,
} from '@app/store/settingsSaveQueue.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { bumpPictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  // Queued with the map settings' saves, which send `maxZoom` too.
  handle: ({ dispatch, getState, action, toastError }) => {
    // The modal the save came from, which only it closes.
    const modal = getState().main.activeModal;

    return queueSettingsSave(async () => {
      try {
        const { settings, user, keepOpen } = action.payload;

        if (getState().auth.user) {
          await patchAccountSettings(getState, { ...user, settings });

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

        trackMatomo(['trackEvent', 'Settings', 'save']);

        dispatch(
          toastsAdd({
            id: 'settings.saved',
            messageKey: 'saveSuccess',
            messageLoader: loadMapSettingsMessages,
            style: 'info',
            timeout: 5000,
          }),
        );

        if (!keepOpen && getState().main.activeModal === modal) {
          dispatch(setActiveModal(null));
        }
      } catch (err) {
        await toastError(err, loadMapSettingsMessages, 'savingError');
      }
    });
  },
};
