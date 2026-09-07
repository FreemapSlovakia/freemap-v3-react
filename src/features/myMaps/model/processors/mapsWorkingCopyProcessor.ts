import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { authLogout } from '@features/auth/model/actions.js';
import {
  clearMapRecords,
  deleteMapRecord,
  putMapRecord,
} from '../../mapStore.js';
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
    if (authLogout.match(action)) {
      written = null;

      dropped = null;

      // The copies hold map names and tracks of the account that just left; a
      // shared browser must not serve them to the next one. A public map stays
      // connected, so its copy is kept — otherwise the processor writes it
      // straight back, and its track would be lost on the next reload anyway.
      clearMapRecords(getState().myMaps.activeMap?.id).catch((err) => {
        console.warn('Error clearing map working copies:', err);
      });

      return;
    }

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

// The map whose copy was last dropped. This processor sees every dispatch, so
// without it a baseline that stays unestablished would queue a fresh delete on
// each one — at frame rate while the map is panned.
let dropped: string | null = null;

function persist(state: RootState): void {
  // A location change applies the URL over many dispatches — clearing the OSM
  // selection resets the track long before it claims the map it is opening — so
  // for that whole pass the screen belongs to no single map. Writing then would
  // file the torn state under the map being left, and a dirty map's track has
  // nowhere else to come back from. URL updating is suspended for exactly that
  // window (and for a drag, which likewise commits at its end).
  if (!isUrlUpdatingEnabled()) {
    return;
  }

  const { activeMap, savedFingerprint, loadMeta, restoring } = state.myMaps;

  if (!activeMap || savedFingerprint === null) {
    written = null;

    dropped = null;

    return;
  }

  // `UNKNOWN_FINGERPRINT` means the baseline couldn't be established. Storing it
  // would make the map read as unsaved on every future reload, and leaving an
  // older record in place would let a stale track and digest be replayed — so
  // drop it and let the next load establish a real one. Dropping is keyed by
  // `activeMap` alone, so it stays right even mid-switch.
  if (savedFingerprint === UNKNOWN_FINGERPRINT) {
    written = null;

    if (dropped !== activeMap.id) {
      dropped = activeMap.id;

      deleteMapRecord(activeMap.id).catch((err) => {
        console.warn('Error clearing map working copy:', err);

        // Left to be retried on the next dispatch rather than assumed gone.
        dropped = null;
      });
    }

    return;
  }

  // A load or restore of another map is in flight, so what's on screen is
  // already turning into that map's content while `activeMap` still names the
  // one being left. Writing now would file the incoming map's track under the
  // outgoing map's id. The cache is left alone: once the switch completes, the
  // new map no longer matches it and is written normally.
  const incoming = loadMeta?.id ?? restoring?.mapId;

  if (incoming !== undefined && incoming !== activeMap.id) {
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

  const record = { meta: activeMap, savedFingerprint, track, trackUID, gpxUrl };

  written = record;

  // A record exists again, so a later unestablished baseline has one to drop.
  dropped = null;

  // `Date.now()` only orders records for pruning.
  putMapRecord(record, Date.now()).catch((err) => {
    // Best effort: the comparison that drives the unsaved marker reads live
    // state, so a failed write costs a reload's worth of restore, not accuracy.
    console.warn('Error writing map working copy:', err);

    written = null;
  });
}
