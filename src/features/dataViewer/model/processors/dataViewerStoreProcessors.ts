import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { entryLoading } from '@app/url/entryContent.js';
import { isUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { storeSnapshot } from '../../trackStore.js';
import { loadDataViewerMessages } from '../../translations/loadDataViewerMessages.js';
import { localTrack } from '../localTrack.js';

/** The version last handed to the store, so each one is written once. */
let lastStored: object | undefined;

/**
 * Snapshots every version of the local data, so the history entry the URL
 * writes for it (`urlProcessor`) can put it back.
 *
 * Best effort by design: for an imported file this only saves the user from
 * re-opening it, and a failed write is not worth interrupting them over. The one
 * caller that needs the guarantee — the GPS recorder finishing a ride, which then
 * deletes the phone's copy — calls `storeTrackDurably` itself and reads the answer.
 */
export const dataViewerStoreProcessor: Processor = {
  handle: async ({ getState, dispatch }) => {
    // Not while a drag holds the URL back: a snapshot per pointer move would
    // evict the ones earlier history entries name. Its dragend writes the last.
    // Nor while an entry is half restored, which is no version of anything.
    if (!isUrlUpdatingEnabled() || entryLoading()) {
      return;
    }

    const geojson = localTrack(getState());

    if (!geojson || geojson === lastStored) {
      return;
    }

    lastStored = geojson;

    try {
      await storeSnapshot(geojson);
    } catch (err) {
      console.warn('Storing the loaded track failed:', err);

      // The entry already names the snapshot, so a reload would find nothing:
      // said now, while saving it to a map can still keep it.
      dispatch(
        toastsAdd({
          id: 'dataViewer.snapshotFailed',
          messageKey: 'snapshotFailed',
          messageLoader: loadDataViewerMessages,
          style: 'warning',
        }),
      );
    }
  },
};
