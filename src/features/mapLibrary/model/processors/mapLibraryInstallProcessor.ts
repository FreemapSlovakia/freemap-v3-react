import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { queueSettingsSave } from '@app/store/settingsSaveQueue.js';
import { accountSettingsOf } from '@features/map/model/reducer.js';
import { loadMapSettingsMessages } from '@features/mapSettings/translations/loadMapSettingsMessages.js';
import { mapLibraryInstall } from '../actions.js';

/**
 * Saves the account settings after an install or uninstall, queued with every
 * other settings save; each sends the state at its turn. Nothing cancels it, as
 * closing the library must not drop a click.
 */
export const mapLibraryInstallProcessor: Processor<typeof mapLibraryInstall> = {
  actionCreator: mapLibraryInstall,
  handle: ({ getState, toastError }) =>
    queueSettingsSave(async () => {
      if (!getState().auth.user) {
        return;
      }

      try {
        await httpRequest({
          getState,
          method: 'PATCH',
          url: '/auth/settings',
          expectedStatus: 204,
          cancelActions: [],
          data: { settings: accountSettingsOf(getState().map) },
        });
      } catch (err) {
        await toastError(err, loadMapSettingsMessages, 'savingError');
      }
    }),
};
