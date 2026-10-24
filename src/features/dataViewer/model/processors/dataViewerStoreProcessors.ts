import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { isUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { getSnapshot, snapshotKey, storeSnapshot } from '../../trackStore.js';
import { loadDataViewerMessages } from '../../translations/loadDataViewerMessages.js';
import {
  dataViewerAddFeatures,
  dataViewerRestoreStored,
  dataViewerRestoreStoredDone,
  dataViewerSetData,
  dataViewerSetTrackUID,
} from '../actions.js';
import { homedElsewhere, localTrack } from '../localTrack.js';

/** The version last handed to the store, so each one is written once. */
let lastStored: object | undefined;

function forgetEntrySnapshot() {
  try {
    history.replaceState(
      { ...(history.state ?? {}), tr: undefined },
      '',
      window.location.href,
    );
  } catch {
    // A document opened from a URL `replaceState` refuses (see `index.tsx`).
  }
}

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
    if (!isUrlUpdatingEnabled()) {
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

/**
 * Puts back the snapshot a history entry names. Stands down for data the URL or
 * a map names, which is the thing the user actually asked for.
 */
export const dataViewerRestoreStoredProcessor: Processor<
  typeof dataViewerRestoreStored
> = {
  actionCreator: dataViewerRestoreStored,
  handle: async ({ action, dispatch, getState }) => {
    const key = action.payload;

    if (key === null) {
      return;
    }

    // However it ends, it must say so: anything waiting for the track — the
    // elevation chart a URL asked to reopen — cannot otherwise tell an empty
    // viewer from one whose track is still on its way out of IndexedDB.
    try {
      const record = await getSnapshot(key);

      // A later history step has asked for something else meanwhile.
      if (getState().trackViewer.restoringStored !== key) {
        return;
      }

      // A track still being fetched because the URL names it has nothing in the
      // viewer yet to say so, and IndexedDB would win that race — as it would
      // against a saved map being opened, whose own copy is the one to show.
      const { myMaps } = getState();

      if (homedElsewhere(getState()) || myMaps.loadMeta || myMaps.restoring) {
        return;
      }

      if (!record) {
        // Off the entry first, so the state no longer matching it doesn't read
        // as a new step and push over the Forward history.
        forgetEntrySnapshot();

        // An older build's track is gone, but the drawings its params gave stay.
        if (key !== true && getState().trackViewer.trackGeojson) {
          dispatch(dataViewerRestoreStored(null));

          dispatch(
            toastsAdd({
              id: 'dataViewer.snapshotGone',
              messageKey: 'snapshotGone',
              messageLoader: loadDataViewerMessages,
              style: 'warning',
              timeout: 5000,
            }),
          );
        }

        return;
      }

      // Nothing on the server to share it back by: whatever it was, it is a local
      // track now.
      dispatch(dataViewerSetTrackUID(null));

      if (key === true) {
        // The older build's track, beside the drawings its entry's params put
        // on the map.
        dispatch(dataViewerAddFeatures({ features: record.geojson.features }));

        // Named by its key from now on — before the URL resumes, so the
        // changed `tr` isn't taken for a new step and pushed.
        const local = localTrack(getState());

        try {
          history.replaceState(
            {
              ...(history.state ?? {}),
              tr: local ? snapshotKey(local) : undefined,
            },
            '',
            window.location.href,
          );
        } catch {
          // As in `forgetEntrySnapshot`.
        }
      } else {
        dispatch(dataViewerSetData({ trackGeojson: record.geojson }));
      }
    } finally {
      dispatch(dataViewerRestoreStoredDone(key));
    }
  },
};
