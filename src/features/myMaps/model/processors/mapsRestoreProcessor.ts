import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  trackViewerDelete,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
  trackViewerSetData,
  trackViewerSetGpxUrl,
  trackViewerSetTrackUID,
} from '@features/trackViewer/model/actions.js';
import type { FeatureCollection } from 'geojson';
import { getMapRecord } from '../../mapStore.js';
import { getOfflineMap } from '../../offlineStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  mapsDisconnect,
  mapsLoad,
  mapsRestore,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '../actions.js';
import { loadMapDocument } from '../loadMapDocument.js';
import {
  fingerprintDocument,
  fingerprintState,
  UNKNOWN_FINGERPRINT,
} from '../mapDocument.js';

/**
 * Opens the map named by `id=` in the URL.
 *
 * With the content restored from the history entry and a working copy in the
 * browser, the map continues from them: the meta and the track come back, and
 * comparing the result against the stored digest says whether there are unsaved
 * changes. Only when there are none is the map re-read from the backend, so it
 * stays fresh without ever overwriting unsaved work.
 *
 * Without restored content — a fresh tab, a bookmark, a shared link — there is
 * nothing to preserve and the map is read from the backend, even when this
 * browser holds a copy from an earlier visit.
 *
 * Owns the track for this restore: `handleLocationChange` defers the fetch a
 * `track-uid=` / `import-url=` would start, so nothing can race it.
 */
export const mapsRestoreProcessor: Processor<typeof mapsRestore> = {
  actionCreator: mapsRestore,
  async handle({ getState, dispatch, action, toastError }) {
    const {
      mapId,
      ignoreMap,
      ignoreLayers,
      hasRestoredContent,
      trackUID,
      gpxUrl,
    } = action.payload;

    // Another restore, a plain load or a disconnect has taken over while this
    // one was reading storage or the network. Its decisions concern a map the
    // user has moved on from, so none of them may be applied.
    const superseded = () => getState().myMaps.restoringId !== mapId;

    const load = () => {
      dispatch(mapsLoad({ id: mapId, ignoreMap, ignoreLayers }));
    };

    // Restores the track and where it came from, so the map matches what it was
    // saved as and its URL keeps `track-uid=` / `import-url=`. Set directly: the
    // track is already here and must not be re-fetched over.
    const restoreTrack = (
      track: FeatureCollection | null,
      uid: string | null,
      url: string | null,
    ) => {
      const current = getState().trackViewer.trackGeojson;

      if (track) {
        if (track !== current) {
          dispatch(trackViewerSetData({ trackGeojson: track }));
        }

        dispatch(trackViewerSetTrackUID(uid));

        dispatch(trackViewerSetGpxUrl(url));

        return;
      }

      // This map has no track, so drop one left over from the map before it.
      if (current) {
        dispatch(trackViewerDelete());
      }

      // Nothing stored, but the URL names a source — let it load.
      if (trackUID !== undefined) {
        dispatch(trackViewerDownloadTrack(trackUID));
      } else if (gpxUrl !== undefined) {
        dispatch(trackViewerGpxLoad(gpxUrl));
      }
    };

    // The history entry carries the content; the browser copy is per-tab and
    // says nothing about what a fresh tab is showing.
    if (!hasRestoredContent) {
      load();

      return;
    }

    let record;

    try {
      record = await getMapRecord(mapId);
    } catch (err) {
      console.warn('Error reading map working copy:', err);
    }

    if (superseded()) {
      return;
    }

    if (record) {
      dispatch(mapsSetMeta(record.meta));

      restoreTrack(record.track, record.trackUID, record.gpxUrl);

      dispatch(mapsSetSavedFingerprint(record.savedFingerprint));

      // Nothing unsaved to protect, so take a fresh copy from the backend.
      if (fingerprintState(getState()) === record.savedFingerprint) {
        load();
      }

      return;
    }

    // Content was restored but there is no copy to compare it against — pruned,
    // cleared, or storage unavailable. A plain load would silently discard that
    // content, so read the stored document only to learn what the map holds and
    // let the comparison decide whether what's on screen differs from it.
    let document;

    try {
      document = await loadMapDocument(mapId, getState, [
        mapsRestore,
        mapsLoad,
        mapsDisconnect,
      ]);
    } catch (err) {
      // Offline: a map kept for offline use still answers from its cached copy.
      document = await getOfflineMap(mapId).catch(() => undefined);

      if (!document) {
        await toastError(err, loadMyMapsMessages, 'fetchError');
      }
    }

    if (superseded()) {
      return;
    }

    if (!document) {
      // Nothing to compare against, so the map can't be reported as saved. The
      // restored content stands, and an explicit Reload re-establishes a
      // baseline.
      restoreTrack(null, null, null);

      dispatch(mapsSetSavedFingerprint(UNKNOWN_FINGERPRINT));

      return;
    }

    dispatch(mapsSetMeta(document.meta));

    restoreTrack(
      document.data.trackViewer?.trackGeojson ?? null,
      document.data.trackViewer?.trackUID ?? null,
      document.data.trackViewer?.gpxUrl ?? null,
    );

    dispatch(
      mapsSetSavedFingerprint(fingerprintDocument(document.data, getState())),
    );
  },
};
