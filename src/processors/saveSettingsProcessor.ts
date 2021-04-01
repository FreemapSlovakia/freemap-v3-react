import { authSetUser } from 'fm3/actions/authActions';
import {
  saveSettings,
  setActiveModal,
  setExpertMode,
  setHomeLocation,
} from 'fm3/actions/mainActions';
import {
  mapSetOverlayOpacity,
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
      homeLocation,
      overlayOpacity,
      overlayPaneOpacity,
      expertMode,
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
        data: Object.assign(
          {
            name: user.name,
            email: user.email,
            sendGalleryEmails: user.sendGalleryEmails,
            preventTips,
            settings: {
              overlayOpacity,
              overlayPaneOpacity,
              expertMode,
              trackViewerEleSmoothingFactor,
            },
          },
          homeLocation ? { lat: homeLocation.lat, lon: homeLocation.lon } : {},
        ),
      });

      dispatch(authSetUser(Object.assign({}, getState().auth.user, user)));
    }

    dispatch(setHomeLocation(homeLocation));

    dispatch(mapSetOverlayOpacity(overlayOpacity));

    dispatch(mapSetOverlayPaneOpacity(overlayPaneOpacity));

    dispatch(setExpertMode(expertMode));

    dispatch(trackViewerSetEleSmoothingFactor(trackViewerEleSmoothingFactor));

    dispatch(tipsPreventNextTime({ value: preventTips, save: false }));

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
