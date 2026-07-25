import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { clearTrackDraft, putTrackDraft } from '../../draftStore.js';
import { mapsLoaded, mapsSetDirty } from '../actions.js';

// Snapshot of the fields serialized into the saved map document, minus the map
// viewport, base layers, and the route-planner pick mode (panning, switching the
// background layer, and switching pick mode don't mark the map dirty). Kept as
// slice references so comparison is cheap. Transient view state — the selected
// track, the elevation decision — is deliberately absent: picking a different
// track to chart is not an edit.
type Snapshot = Record<string, unknown>;

function snapshot(s: RootState): Snapshot {
  return {
    lines: s.drawingLines.lines,
    points: s.drawingPoints.points,
    trackedDevices: s.tracking.trackedDevices,
    transportType: s.routePlanner.transportType,
    rpPoints: s.routePlanner.points,
    finishOnly: s.routePlanner.finishOnly,
    mode: s.routePlanner.mode,
    milestones: s.routePlanner.milestones,
    objectsActive: s.objects.active,
    galleryFilter: s.gallery.filter,
    trackGeojson: s.trackViewer.trackGeojson,
    trackUID: s.trackViewer.trackUID,
    gpxUrl: s.trackViewer.gpxUrl,
    customLayers: s.map.customLayers,
    shading: s.map.shading,
  };
}

// Saved-map content that the URL/`history.state` can't carry, so a history
// restore leaves it untouched: a track imported in this session survives Back and
// still diverges from the map even when the target entry was recorded clean.
const NON_URL_FIELDS = ['trackGeojson'] as const;

// The saveable content as of the last clean point (load or save), plus the map it
// belongs to. Comparing against this — rather than the immediately previous state
// — is what lets a drag register: the intermediate moves run with URL updating
// suspended (so they're skipped here), and the committing dispatch at drag end
// differs from the baseline even though it matches the last move.
let baselineMapId: string | undefined;
let baseline: Snapshot | null = null;

// The track source (`track-uid` / `import-url`) the URL declared and whose fetch
// is still in flight, so the arriving geometry is absorbed as baseline content
// rather than mistaken for a user edit. Holding the source rather than a bare
// flag keeps a failed fetch from absorbing a later hand-imported track: an import
// clears `trackUID`, so it no longer matches what's awaited.
let awaitedTrackSource: string | null = null;

// The track last written to the draft store, so an unchanged one isn't rewritten.
// `null` means "nothing stashed", matching an absent `trackGeojson`.
let draftedTrack: unknown = null;

// Set while a draft restore is reading IndexedDB. The track is momentarily
// absent from the state then, which must not be taken as "no track to stash" —
// that would delete the very draft being restored.
let restoringDraft = false;

/**
 * Stashes the imported track so a reload can put it back (see `draftStore`).
 * Written straight through rather than debounced: the track only changes on
 * import, append, elevation update and delete, so this runs a couple of times a
 * session — never during drawing edits or panning.
 */
function writeTrackDraft(state: RootState): void {
  const { trackGeojson } = state.trackViewer;

  const mapId = state.myMaps.activeMap?.id;

  if (!mapId || restoringDraft || trackGeojson === draftedTrack) {
    return;
  }

  draftedTrack = trackGeojson;

  const write = trackGeojson
    ? putTrackDraft({ mapId, trackGeojson })
    : clearTrackDraft();

  write.catch((err) => {
    console.warn('Error writing track draft:', err);
  });
}

/**
 * Drops the stash — the map is in sync again. Also resets the memo, so a later
 * edit re-stashes the track instead of assuming it's still stored.
 */
export function discardTrackDraft(): void {
  draftedTrack = null;

  clearTrackDraft().catch((err) => {
    console.warn('Error clearing track draft:', err);
  });
}

/** Guards the stash while a draft restore reads it (see `restoringDraft`). */
export function setRestoringTrackDraft(value: boolean): void {
  restoringDraft = value;
}

/** Whether a baseline for `mapId` is already established in this session. */
export function hasMapsDirtyBaseline(mapId: string): boolean {
  return baseline !== null && baselineMapId === mapId;
}

/**
 * Marks the current content as the clean reference point. Called on load and at
 * save time.
 *
 * `keepNonUrl` is for a URL/history restore: the restored content becomes the
 * baseline so the `sq`-rounded coordinates it decodes to aren't later read as an
 * edit, but the fields the URL can't carry keep their previous baseline. Folding
 * those in would quietly bless an unsaved imported track as saved content.
 */
export function captureMapsDirtyBaseline(
  state: RootState,
  { keepNonUrl = false } = {},
): void {
  const previous = baseline;

  baselineMapId = state.myMaps.activeMap?.id;

  baseline = snapshot(state);

  if (keepNonUrl && previous) {
    for (const key of NON_URL_FIELDS) {
      baseline[key] = previous[key];
    }
  }
}

/**
 * Announces a pending URL-driven track fetch for `source` (a `track-uid` or an
 * `import-url`), and `null` to drop any stale expectation — called at the start
 * of every location change so a fetch that never lands can't outlive it.
 */
export function expectMapsDirtyTrackHydration(source: string | null): void {
  awaitedTrackSource = source;
}

/**
 * Whether content the URL can't represent diverges from the baseline. A history
 * entry's recorded dirty flag only describes what `sq` restores, so this covers
 * the rest before trusting it.
 */
export function nonUrlContentDiverged(state: RootState): boolean {
  if (!baseline) {
    return false;
  }

  const current = snapshot(state);

  return NON_URL_FIELDS.some((key) => current[key] !== baseline?.[key]);
}

/**
 * Whether the saveable content diverges from the baseline. Equal-but-rebuilt
 * fields advance the baseline reference so later dispatches short-circuit on the
 * cheap reference check instead of re-serializing.
 */
export function isDirtySinceBaseline(state: RootState): boolean {
  if (!baseline) {
    return false;
  }

  const current = snapshot(state);

  for (const key of Object.keys(current)) {
    const before = baseline[key];

    const after = current[key];

    if (before === after) {
      continue;
    }

    // A reducer that rebuilds an equal array/object (e.g. `selectFeature`
    // re-filtering the drawing lines) is not an edit.
    if (JSON.stringify(before) === JSON.stringify(after)) {
      baseline[key] = after;

      continue;
    }

    // The track the URL asked for, arriving late — part of the loaded map, not
    // an edit. A hand-imported track clears `trackUID`, so it no longer matches
    // what's awaited and is correctly treated as a change.
    if (
      key === 'trackGeojson' &&
      awaitedTrackSource !== null &&
      (state.trackViewer.trackUID === awaitedTrackSource ||
        state.trackViewer.gpxUrl === awaitedTrackSource)
    ) {
      awaitedTrackSource = null;

      baseline[key] = after;

      continue;
    }

    return true;
  }

  return false;
}

/**
 * Flags the active map dirty once its saveable content diverges from the loaded
 * or last-saved state.
 */
export const mapsDirtyProcessor: Processor = {
  handle({ getState, dispatch, action }) {
    const state = getState();

    const { activeMap, dirty } = state.myMaps;

    if (!activeMap) {
      if (baselineMapId !== undefined) {
        // Disconnected — nothing left to restore into.
        discardTrackDraft();
      }

      baseline = null;

      baselineMapId = undefined;

      return;
    }

    // A load is a fresh reference point. Handled before the URL-updating gate
    // because loads also happen while a restore has it suspended. A merging load
    // leaves the content diverging from the map document, which the reducer
    // reports as dirty; the baseline still moves to what's now on screen.
    if (mapsLoaded.match(action)) {
      captureMapsDirtyBaseline(state);

      // The stored copy is now on screen, so any older draft is obsolete. A
      // merging load diverges immediately and re-stashes on the next dispatch.
      discardTrackDraft();

      return;
    }

    // Programmatic restores and drag gestures suspend URL updating; skip them so
    // restores don't self-flag and a drag is judged once, at the committing
    // dispatch after it re-enables.
    if (!isUrlUpdatingEnabled()) {
      return;
    }

    if (!hasMapsDirtyBaseline(activeMap.id)) {
      captureMapsDirtyBaseline(state);

      return;
    }

    if (dirty) {
      // Keep the stash current for as long as the map has unsaved changes. The
      // flag is set by the nested dispatch below, so the first edit lands here
      // on re-entry.
      writeTrackDraft(state);

      return;
    }

    if (isDirtySinceBaseline(state)) {
      dispatch(mapsSetDirty(true));
    }
  },
};
