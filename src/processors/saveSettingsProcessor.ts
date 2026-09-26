import { httpRequest } from '@app/httpRequest.js';
import {
  applySettings,
  saveSettings,
  setActiveModal,
} from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootAction } from '@app/store/rootAction.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { bumpPictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import {
  mapApplyCombination,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import { accountSettingsOf } from '@features/map/model/reducer.js';
import { activeCombinationsSelector } from '@features/map/model/selectors.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  handle: async ({ dispatch, getState, action, toastError }) => {
    try {
      const {
        settings,
        user,
        keepOpen,
        activateLayerType,
        activateCombination,
      } = action.payload;

      // The API replaces settings whole, so a save sends all of them.
      const mergedSettings = settings && {
        ...accountSettingsOf(getState().map),
        ...settings,
      };

      if (getState().auth.user) {
        await httpRequest({
          getState,
          method: 'PATCH',
          url: '/auth/settings',
          expectedStatus: 204,
          cancelActions: [setActiveModal, saveSettings],
          data: {
            ...user,
            settings: mergedSettings,
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

      // After the request, which the map may have changed under, and before
      // the saved version replaces the combination being saved.
      const previous = activeCombinationsSelector(getState()).find(
        (c) => c.id === activateCombination,
      );

      if (settings) {
        dispatch(applySettings(settings));
      }

      trackMatomo(['trackEvent', 'Settings', 'save']);

      // An active one is re-applied, so the map shows what was just saved.
      if (previous) {
        dispatch(mapApplyCombination({ id: previous.id, replaces: previous }));
      }

      let messageKey = 'saveSuccess';

      let activateAction: RootAction | undefined;

      if (activateLayerType !== undefined) {
        messageKey = 'customMapSaved';

        if (!getState().map.layers.includes(activateLayerType)) {
          activateAction = mapToggleLayer({
            type: activateLayerType,
            enable: true,
          });
        }
      } else if (activateCombination !== undefined) {
        messageKey = 'combinationSaved';

        if (!previous) {
          activateAction = mapApplyCombination({ id: activateCombination });
        }
      }

      dispatch(
        toastsAdd({
          id: 'settings.saved',
          messageKey,
          messageLoader: loadMapSettingsMessages,
          style: 'info',
          timeout: activateAction ? 10_000 : 5000,
          actions: activateAction
            ? [
                {
                  name: getMessages()?.mapLayers.activate ?? '',
                  action: activateAction,
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
