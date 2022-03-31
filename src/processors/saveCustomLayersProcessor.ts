import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { mapSetCustomLayers } from 'fm3/actions/mapActions';
import { httpRequest } from 'fm3/httpRequest';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const saveCustomLayersProcessor: Processor<typeof mapSetCustomLayers> = {
  actionCreator: mapSetCustomLayers,
  errorKey: 'settings.savingError',
  handle: async ({ getState }) => {
    if (!getState().auth.user) {
      return;
    }

    const { layersSettings, overlayPaneOpacity, customLayers } = getState().map;

    if (getState().auth.user) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        cancelActions: [setActiveModal, saveSettings],
        data: {
          settings: {
            layersSettings,
            overlayPaneOpacity,
            customLayers,
          },
        },
      });
    }
  },
};
