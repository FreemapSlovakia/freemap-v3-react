import {
  mapSetTileFormat,
  mapSetOverlayOpacity,
  mapSetOverlayPaneOpacity,
} from 'fm3/actions/mapActions';
import {
  setHomeLocation,
  setActiveModal,
  setExpertMode,
  saveSettings,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';
import { authSetUser } from 'fm3/actions/authActions';
import { tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';

export const saveSettingsProcessor: IProcessor<typeof saveSettings> = {
  actionCreator: saveSettings,
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const {
      tileFormat,
      homeLocation,
      overlayOpacity,
      overlayPaneOpacity,
      expertMode,
      trackViewerEleSmoothingFactor,
      preventTips,
    } = action.payload;

    // TODO don't save user if not changed

    const { user } = getState().auth;
    if (user) {
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
            settings: {
              tileFormat,
              overlayOpacity,
              overlayPaneOpacity,
              expertMode,
              trackViewerEleSmoothingFactor,
            },
            preventTips,
          },
          homeLocation ? { lat: homeLocation.lat, lon: homeLocation.lon } : {},
        ),
      });

      dispatch(
        authSetUser(
          Object.assign({}, getState().auth.user, {
            name: user.name,
            email: user.email,
          }),
        ),
      );
    }

    dispatch(mapSetTileFormat(tileFormat));
    dispatch(setHomeLocation(homeLocation));
    dispatch(mapSetOverlayOpacity(overlayOpacity));
    dispatch(mapSetOverlayPaneOpacity(overlayPaneOpacity));
    dispatch(setExpertMode(expertMode));
    dispatch(trackViewerSetEleSmoothingFactor(trackViewerEleSmoothingFactor));
    dispatch(tipsPreventNextTime(preventTips));
    dispatch(
      toastsAdd({
        collapseKey: 'settings.saved',
        messageKey: 'settings.saveSuccess',
        style: 'info',
        timeout: 5000,
      }),
    );
    dispatch(setActiveModal(null));
  },
};
