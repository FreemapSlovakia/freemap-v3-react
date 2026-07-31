import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import {
  dataViewerDelete,
  dataViewerDownloadTrack,
  dataViewerGpxLoad,
  dataViewerSetData,
  dataViewerSetGpxUrl,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import type { FeatureCollection } from 'geojson';
import { getMapRecord } from '../../mapStore.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import {
  mapsDisconnect,
  mapsLoad,
  mapsRestore,
  mapsRestoreEnded,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '../actions.js';
import { readMapDocument } from '../loadMapDocument.js';
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
export const mapsRestoreProcessor: Processor = {
  // Re-runs on the auth actions, like `mapsLoadProcessor`: bootstrap decodes the
  // URL before the token is validated, and reading the map with a stale one
  // would 401 and disconnect the user from their own map.
  actionCreator: [mapsRestore, authSetUser, authLogout],
  async handle({ getState, dispatch, toastError }) {
    const { auth, myMaps } = getState();

    const restoring = myMaps.restoring;

    if (!restoring || (auth.user && !auth.validated)) {
      return;
    }

    const {
      mapId,
      ignoreMap,
      ignoreLayers,
      hasRestoredContent,
      trackUID,
      gpxUrl,
    } = restoring;

    // Another restore, a plain load or a disconnect has taken over while this
    // one was reading storage or the network. Its decisions concern a map the
    // user has moved on from, so none of them may be applied.
    const superseded = () => getState().myMaps.restoring?.mapId !== mapId;

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
          dispatch(dataViewerSetData({ trackGeojson: track }));
        }

        dispatch(dataViewerSetTrackUID(uid));

        dispatch(dataViewerSetGpxUrl(url));

        return;
      }

      // This map has no track, so drop one left over from the map before it.
      if (current) {
        dispatch(dataViewerDelete());
      }

      // No geometry, but a source names one — the map's own, or failing that
      // the one the URL asked for.
      const sourceUid = uid ?? trackUID;

      const sourceUrl = url ?? gpxUrl;

      // Both, when the URL names both — as the two independent `track-uid=` /
      // `import-url=` fetches `handleLocationChange` deferred would have done.
      if (sourceUid) {
        dispatch(dataViewerDownloadTrack(sourceUid));
      }

      if (sourceUrl) {
        dispatch(dataViewerGpxLoad(sourceUrl));
      }
    };

    // The history entry carries the content; the browser copy is per-tab and
    // says nothing about what a fresh tab is showing.
    if (!hasRestoredContent) {
      load();

      // `handleLocationChange` deferred the track the URL names to this
      // processor, so it has to be started here or it never loads at all.
      if (trackUID !== undefined) {
        dispatch(dataViewerDownloadTrack(trackUID));
      }

      if (gpxUrl !== undefined) {
        dispatch(dataViewerGpxLoad(gpxUrl));
      }

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
      document = await readMapDocument(mapId, getState, [
        mapsRestore,
        mapsLoad,
        mapsDisconnect,
        authSetUser,
        authLogout,
      ]);
    } catch (err) {
      // An abort is something else taking over — a newer restore or load, or the
      // auth check this processor re-runs on, which a second tab can trigger at
      // any moment. That is not a map that failed to open, so nothing below may
      // treat it as one and disconnect; the run it belongs to decides.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      await toastError(err, loadMyMapsMessages, 'fetchError');
    }

    if (superseded()) {
      return;
    }

    if (!document) {
      restoreTrack(null, null, null);

      if (getState().myMaps.activeMap?.id === mapId) {
        // A reload of the map that is already connected: it stays, but nothing
        // establishes a baseline, so it can't be reported as saved. An explicit
        // Reload re-establishes one. The only path that opens no map and so has
        // to release itself; every other ends on a meta, a load or a disconnect.
        dispatch(mapsSetSavedFingerprint(UNKNOWN_FINGERPRINT));

        dispatch(mapsRestoreEnded(mapId));
      } else {
        // The map couldn't be opened, so leave none connected. Staying connected
        // to the map that was open before would attribute this content to it —
        // and Save would then write it over that map.
        dispatch(mapsDisconnect());
      }

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
