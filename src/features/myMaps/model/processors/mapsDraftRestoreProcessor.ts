import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
} from '@features/trackViewer/model/actions.js';
import { getTrackDraft } from '../../draftStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import { mapsDraftRestore } from '../actions.js';
import { loadMapDocument } from '../loadMapDocument.js';
import {
  captureMapsDirtyBaseline,
  setRestoringTrackDraft,
} from './mapsDirtyProcessor.js';

/**
 * Puts the imported track back after reloading a map with unsaved changes — the
 * one piece of a saved map that neither the URL nor localStorage carries (see
 * `draftStore`).
 *
 * Owns the track for this restore: `handleLocationChange` defers the fetch a
 * `track-uid=` / `import-url=` in the URL would otherwise start, because the two
 * would race and the fetched copy could overwrite the unsaved one. Whichever
 * source wins here is therefore the only one that runs.
 */
export const mapsDraftRestoreProcessor: Processor<typeof mapsDraftRestore> = {
  actionCreator: mapsDraftRestore,
  async handle({ getState, dispatch, action, toastError }) {
    const { mapId, trackUID, gpxUrl } = action.payload;

    // The track is absent from the state until the read lands, which must not be
    // mistaken for "no track to stash" and delete the draft being restored.
    setRestoringTrackDraft(true);

    try {
      const draft = await getTrackDraft();

      if (draft?.mapId === mapId) {
        // A stash for this map is authoritative — it holds the unsaved track, and
        // a `null` records that the map genuinely has none.
        if (draft.trackGeojson && !getState().trackViewer.trackGeojson) {
          dispatch(trackViewerSetData({ trackGeojson: draft.trackGeojson }));
        }

        return;
      }

      // No stash for this map (lost, or written by another tab). Whatever the URL
      // declares is the next best source.
      if (trackUID !== undefined) {
        dispatch(trackViewerDownloadTrack(trackUID));

        return;
      }

      if (gpxUrl !== undefined) {
        dispatch(trackViewerGpxLoad(gpxUrl));

        return;
      }

      // Nothing names the track, so fall back to the stored map document. Leaving
      // it out would keep the map flagged dirty with no track at all, and the next
      // save would erase the stored one.
      try {
        const { data } = await loadMapDocument(mapId, getState, [
          mapsDraftRestore,
        ]);

        const trackGeojson = data.trackViewer?.trackGeojson;

        if (trackGeojson && !getState().trackViewer.trackGeojson) {
          dispatch(trackViewerSetData({ trackGeojson }));
        }
      } catch (err) {
        // Offline or the map is gone: the drawing edits the URL restored still
        // stand, so report rather than tear the restore down.
        await toastError(err, loadMyMapsMessages, 'fetchError');
      }
    } finally {
      setRestoringTrackDraft(false);

      // What's on screen now is the reference point for further edits; the map
      // stays flagged dirty, since it still diverges from the stored copy.
      captureMapsDirtyBaseline(getState(), { keepNonUrl: true });
    }
  },
};
