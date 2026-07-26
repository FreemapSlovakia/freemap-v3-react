import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { deleteMapRecord, putMapRecord } from '../../mapStore.js';
import { mapsLoaded, mapsSetSavedFingerprint } from '../actions.js';
import { fingerprintState, UNKNOWN_FINGERPRINT } from '../mapDocument.js';

/**
 * Sets the digest a loaded map is compared against, and keeps the browser's
 * working copy of the active map up to date so a reload can continue from it.
 *
 * The copy holds the track, the one part of a map the URL can't carry; the rest
 * is restored from the URL, which is written on every dispatch and so is never
 * stale. It is keyed by map id, so another map — or another tab — can't stand in
 * for this one.
 */
export const mapsWorkingCopyProcessor: Processor = {
  handle({ getState, dispatch, action }) {
    const state = getState();

    if (mapsLoaded.match(action)) {
      // A plain load puts the stored document on screen, so the screen itself is
      // the reference. A merging load keeps what was already there alongside it,
      // so nothing on screen matches the stored map and it is reported unsaved.
      const baseline = action.payload.merge
        ? UNKNOWN_FINGERPRINT
        : fingerprintState(state);

      dispatch(mapsSetSavedFingerprint(baseline));

      return;
    }

    persist(getState());
  },
};

// Everything the record holds, as last written, so an unchanged map isn't
// rewritten. Purely a cache: a miss costs one redundant write, never a wrong
// answer — including the meta, so a rename is picked up.
let written: {
  meta: unknown;
  savedFingerprint: string;
  track: unknown;
  trackUID: string | null;
  gpxUrl: string | null;
} | null = null;

function persist(state: RootState): void {
  const { activeMap, savedFingerprint } = state.myMaps;

  if (!activeMap || savedFingerprint === null) {
    written = null;

    return;
  }

  // `UNKNOWN_FINGERPRINT` means the baseline couldn't be established. Storing it
  // would make the map read as unsaved on every future reload, and leaving an
  // older record in place would let a stale track and digest be replayed — so
  // drop it and let the next load establish a real one.
  if (savedFingerprint === UNKNOWN_FINGERPRINT) {
    written = null;

    deleteMapRecord(activeMap.id).catch((err) => {
      console.warn('Error clearing map working copy:', err);
    });

    return;
  }

  const { trackGeojson: track, trackUID, gpxUrl } = state.trackViewer;

  if (
    written &&
    written.meta === activeMap &&
    written.savedFingerprint === savedFingerprint &&
    written.track === track &&
    written.trackUID === trackUID &&
    written.gpxUrl === gpxUrl
  ) {
    return;
  }

  written = { meta: activeMap, savedFingerprint, track, trackUID, gpxUrl };

  // `Date.now()` only orders records for pruning.
  putMapRecord(
    { meta: activeMap, savedFingerprint, track, trackUID, gpxUrl },
    Date.now(),
  ).catch((err) => {
    // Best effort: the comparison that drives the unsaved marker reads live
    // state, so a failed write costs a reload's worth of restore, not accuracy.
    console.warn('Error writing map working copy:', err);

    written = null;
  });
}
