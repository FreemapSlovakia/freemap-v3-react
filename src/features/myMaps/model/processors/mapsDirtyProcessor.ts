import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { mapsSetDirty } from '../actions.js';

// Snapshot of the fields serialized into the saved map document, minus the map
// viewport, base layers, and the route-planner pick mode (panning, switching the
// background layer, and switching pick mode don't mark the map dirty). Kept as
// slice references so comparison is cheap.
type Snapshot = Record<string, unknown>;

function snapshot(s: RootState): Snapshot {
  return {
    lines: s.drawingLines.lines,
    points: s.drawingPoints.points,
    trackedDevices: s.tracking.trackedDevices,
    showLine: s.tracking.showLine,
    showPoints: s.tracking.showPoints,
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

// The saved content and the active map it belongs to, captured at the last clean
// point (load or save). Comparing against this — rather than the immediately
// previous state — is what lets a drag register: the intermediate moves run with
// URL updating suspended (so they're skipped here), and the committing dispatch
// at drag end differs from the baseline even though it matches the last move.
let baselineMap: RootState['myMaps']['activeMap'];
let baseline: Snapshot | null = null;

/**
 * Discards the captured baseline so the next dispatch re-establishes it from the
 * current state. Called after a URL/history restore (`handleLocationChange`),
 * where the restored content becomes the new clean reference — its `sq`-decoded
 * coordinates are rounded and so wouldn't byte-match the pre-restore baseline,
 * which would otherwise surface as a spurious edit on the next dispatch.
 */
export function resetMapsDirtyBaseline(): void {
  baseline = null;

  baselineMap = undefined;
}

/**
 * Flags the active map dirty once its saveable content diverges from the loaded
 * or last-saved state. A reference check keeps the common case cheap; a field
 * whose reference changed falls back to a structural comparison so a reducer
 * that rebuilds an equal array/object (e.g. `selectFeature` re-filtering the
 * drawing lines) isn't mistaken for an edit, and the baseline reference is then
 * advanced so the same field isn't re-serialized on every later dispatch.
 */
export const mapsDirtyProcessor: Processor = {
  handle({ getState, dispatch }) {
    // Programmatic restores (popstate / initial rehydrate) and drag gestures
    // suspend URL updating; skip them so restores don't self-flag and drag
    // fallout is only judged once, at the committing dispatch after re-enabling.
    if (!isUrlUpdatingEnabled()) {
      return;
    }

    const state = getState();

    const { activeMap, dirty } = state.myMaps;

    if (!activeMap) {
      baseline = null;

      return;
    }

    const current = snapshot(state);

    // (Re)capture the clean baseline when the active map identity changes — a
    // load or the post-save meta refresh — establishing the new saved reference
    // point without flagging it dirty.
    if (!baseline || baselineMap !== activeMap) {
      baselineMap = activeMap;

      baseline = current;

      return;
    }

    if (dirty) {
      return;
    }

    for (const key of Object.keys(current)) {
      const before = baseline[key];

      const after = current[key];

      if (before === after) {
        continue;
      }

      if (JSON.stringify(before) === JSON.stringify(after)) {
        // Rebuilt but equal — advance the baseline so later dispatches short-
        // circuit on the reference check instead of re-serializing.
        baseline[key] = after;

        continue;
      }

      dispatch(mapsSetDirty(true));

      return;
    }
  },
};
