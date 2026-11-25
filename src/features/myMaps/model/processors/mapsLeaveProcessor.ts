import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { deletePendingSave } from '../../outboxStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  mapsLeave,
  mapsLoadList,
  mapsRefreshMeta,
  mapsSetMapOffline,
} from '../actions.js';
import { refreshOutbox } from './mapsOutboxProcessor.js';

// TODO the open map's working copy keeps canWrite: true, so a reload restores
// it as writable until the server load corrects it.
export const mapsLeaveProcessor: Processor<typeof mapsLeave> = {
  actionCreator: mapsLeave,
  handle: async ({
    getState,
    dispatch,
    action: { payload: id },
    toastError,
  }) => {
    trackMatomo(['trackEvent', 'MyMaps', 'leave']);

    const name = getState().myMaps.maps.find((map) => map.id === id)?.name;

    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/maps/${id}/writers/me`,
        expectedStatus: 204,
      });
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'leaveError');

      return;
    }

    // Still readable by its link, so it stays open, but no longer saveable.
    const { activeMap, offlineIds } = getState().myMaps;

    if (activeMap?.id === id) {
      dispatch(mapsRefreshMeta({ ...activeMap, canWrite: false }));
    }

    // With no row left to settle them: a queued save would only be refused,
    // and an offline copy could no longer be unflagged.
    try {
      await deletePendingSave(id);

      await refreshOutbox(dispatch);
    } catch (err) {
      console.warn('Error clearing queued save:', err);
    }

    if (offlineIds.includes(id)) {
      dispatch(mapsSetMapOffline({ id, offline: false }));
    }

    dispatch(mapsLoadList());

    dispatch(
      toastsAdd({
        style: 'success',
        timeout: 5000,
        messageKey: 'mapLeft',
        messageParams: { name: name ?? '' },
        messageLoader: loadMyMapsMessages,
      }),
    );
  },
};
