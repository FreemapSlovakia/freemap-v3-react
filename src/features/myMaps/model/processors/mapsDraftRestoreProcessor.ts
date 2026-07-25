import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackViewerSetData } from '@features/trackViewer/model/actions.js';
import { getTrackDraft } from '../../draftStore.js';
import { mapsDraftRestore } from '../actions.js';
import { captureMapsDirtyBaseline } from './mapsDirtyProcessor.js';

/**
 * Puts the imported track back after reloading a map with unsaved changes — the
 * one piece of a saved map that neither the URL nor localStorage carries (see
 * `draftStore`).
 */
export const mapsDraftRestoreProcessor: Processor<typeof mapsDraftRestore> = {
  actionCreator: mapsDraftRestore,
  async handle({ getState, dispatch, action }) {
    const draft = await getTrackDraft();

    if (draft?.mapId !== action.payload) {
      return;
    }

    // Not when the URL already brought one back (`track-uid=` / `import-url=`
    // re-fetch theirs), so a live track is never replaced.
    if (getState().trackViewer.trackGeojson) {
      return;
    }

    dispatch(trackViewerSetData({ trackGeojson: draft.trackGeojson }));

    // What's on screen now is the reference point for further edits; the map
    // stays flagged dirty, since it still diverges from the stored copy.
    captureMapsDirtyBaseline(getState());
  },
};
