import { httpRequest } from '@app/httpRequest.js';
import {
  applySettings,
  saveSettings,
  setActiveModal,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { bumpPictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  handle: async ({ dispatch, getState, action, toastError }) => {
    try {
      const { settings, user, keepOpen, activateLayerType } = action.payload;

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

      trackMatomo(['trackEvent', 'Settings', 'save']);

      const offerActivate =
        activateLayerType !== undefined &&
        !getState().map.layers.includes(activateLayerType);

      dispatch(
        toastsAdd({
          id: 'settings.saved',
          messageKey:
            activateLayerType !== undefined ? 'customMapSaved' : 'saveSuccess',
          messageLoader: loadMapSettingsMessages,
          style: 'info',
          timeout: offerActivate ? 10_000 : 5000,
          actions: offerActivate
            ? [
                {
                  name: getMessages()?.mapLayers.activate ?? '',
                  action: mapToggleLayer({
                    type: activateLayerType,
                    enable: true,
                  }),
                },
              ]
            : undefined,
        }),
      );

      if (!keepOpen) {
        dispatch(setActiveModal(null));
      }
    } catch (err) {
      await toastError(err, loadMapSettingsMessages, 'savingError');
    }
  },
};
