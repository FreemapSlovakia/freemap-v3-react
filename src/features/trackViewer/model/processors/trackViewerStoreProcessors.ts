import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapsSetMeta } from '@features/myMaps/model/actions.js';
import {
  deleteStoredTrack,
  getStoredTrack,
  storeTrack,
} from '../../trackStore.js';
import {
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerRestoreStored,
  trackViewerSetData,
  trackViewerSetGpxUrl,
  trackViewerSetTrackUID,
} from '../actions.js';

/**
 * Whether the track on screen already has somewhere to come back from, in which
 * case storing it again would be a second copy of the same thing:
 *
 * - a **map** carries its track in the my-maps working copy (`mapStore.ts`) and
 *   restores it itself,
 * - a **`track-uid=`** or **`import-url=`** track is named by the URL and is
 *   re-fetched from it.
 *
 * Only a track with none of those — a file import, a conversion, a finished
 * recording — has nothing but this browser, which is the case the store exists
 * for. It is the same condition `TrackViewerMenu` warns about.
 */
function homedElsewhere(state: RootState): boolean {
  return Boolean(
    state.myMaps.activeMap ||
      state.myMaps.loadMeta ||
      state.myMaps.restoring ||
      state.trackViewer.trackUID ||
      state.trackViewer.gpxUrl,
  );
}

/**
 * Keeps the browser's copy of the loaded track in step with what is on screen, so
 * a reload puts back what the user was looking at.
 *
 * Driven off state rather than the action's payload, and off every action that can
 * change the answer, so the outcome does not depend on the order a loader happens
 * to dispatch in — `mapsRestore` sets the map's meta before the track, while an
 * `import-url=` track arrives after its URL was recorded.
 *
 * Best effort by design: for an imported file this only saves the user from
 * re-opening it, and a failed write is not worth interrupting them over. The one
 * caller that needs the guarantee — the GPS recorder finishing a ride, which then
 * deletes the phone's copy — calls `storeTrack` itself and reads the answer.
 */
export const trackViewerStoreProcessor: Processor = {
  actionCreator: [
    trackViewerSetData,
    trackViewerSetTrackUID,
    trackViewerSetGpxUrl,
    // The URL's own loaders: their reducer cases are what set `trackUID` and
    // `gpxUrl`, and listening for them drops the stored copy as soon as the URL
    // names a track — rather than only if its fetch succeeds. A fetch that fails
    // would otherwise leave the copy and its flag behind, for the next reload to
    // race against the download.
    trackViewerDownloadTrack,
    trackViewerGpxLoad,
    mapsSetMeta,
  ],
  handle: async ({ getState }) => {
    const state = getState();

    const trackGeojson = state.trackViewer.trackGeojson;

    try {
      if (!trackGeojson || homedElsewhere(state)) {
        await deleteStoredTrack();
      } else {
        await storeTrack(trackGeojson);
      }
    } catch (err) {
      console.warn('Storing the loaded track failed:', err);
    }
  },
};

/**
 * Drops the copy when the track goes. Deleting the track is the user saying they
 * are done with it, and a copy that outlived it would come back on the next
 * reload as a track they had already thrown away.
 */
export const trackViewerForgetStoredProcessor: Processor = {
  actionCreator: [trackViewerDelete, clearMapFeatures],
  handle: async () => {
    try {
      await deleteStoredTrack();
    } catch (err) {
      console.warn('Discarding the stored track failed:', err);
    }
  },
};

/**
 * Puts the stored track back, for a history entry that says it was holding one.
 * A no-op when something else already owns the viewer — a map named in the URL, a
 * shared track — because that is the thing the user actually asked for.
 */
export const trackViewerRestoreStoredProcessor: Processor = {
  actionCreator: trackViewerRestoreStored,
  handle: async ({ dispatch, getState }) => {
    const record = await getStoredTrack();

    if (!record) {
      // The entry outlived the copy — cleared storage, or a record too old to
      // read. Take the flag off so the next reload doesn't ask again.
      await deleteStoredTrack();

      return;
    }

    // Both halves matter. A track already in the viewer is the one the user asked
    // for — but so is one still being fetched because the URL names it, and that
    // fetch has nothing in the viewer yet to say so. Restoring over it would win
    // the race (IndexedDB beats the network) and then declare a server-hosted
    // track local, taking `track-uid=` out of the URL with it.
    if (getState().trackViewer.trackGeojson || homedElsewhere(getState())) {
      return;
    }

    // Nothing on the server to share it back by: whatever it was, it is a local
    // track now.
    dispatch(trackViewerSetTrackUID(null));

    dispatch(trackViewerSetData({ trackGeojson: record.geojson }));
  },
};
