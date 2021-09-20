import { authSetUser } from 'fm3/actions/authActions';
import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import {
  mapSetLayersSettings,
  mapSetOverlayPaneOpacity,
} from 'fm3/actions/mapActions';
import { tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const saveSettingsProcessor: Processor<typeof saveSettings> = {
  actionCreator: saveSettings,
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const {
      layersSettings,
      overlayPaneOpacity,
      trackViewerEleSmoothingFactor,
      preventTips,
      user,
    } = action.payload;

    // TODO don't save user if not changed

    if (user && getState().auth.user) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        cancelActions: [setActiveModal, saveSettings],
        data: {
          name: user.name,
          email: user.email,
          sendGalleryEmails: user.sendGalleryEmails,
          preventTips,
          settings: {
            layersSettings,
            overlayPaneOpacity,
            trackViewerEleSmoothingFactor,
          },
        },
      });

      dispatch(authSetUser(Object.assign({}, getState().auth.user, user)));
    }

    if (layersSettings !== undefined) {
      dispatch(mapSetLayersSettings(layersSettings));
    }

    if (overlayPaneOpacity !== undefined) {
      dispatch(mapSetOverlayPaneOpacity(overlayPaneOpacity));
    }

    if (trackViewerEleSmoothingFactor !== undefined) {
      dispatch(trackViewerSetEleSmoothingFactor(trackViewerEleSmoothingFactor));
    }

    if (preventTips !== undefined) {
      dispatch(tipsPreventNextTime({ value: preventTips, save: false }));
    }

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
