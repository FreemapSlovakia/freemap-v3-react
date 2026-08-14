import type { RootState } from '@app/store/store.js';
import { getMapContentParts } from '@app/url/mapContentParts.js';
import type { BlockedReason } from './actions.js';
import { fingerprintState } from './mapDocument.js';

/**
 * Whether the map holds anything that replacing it would take off the screen:
 * the content the URL carries, plus the track it can't.
 *
 * Asked before a load, which either merges into what's there or replaces it —
 * on an empty map the two are the same, so there is nothing to ask.
 */
export function mapHasContentSelector(state: RootState): boolean {
  return (
    getMapContentParts(state).length > 0 ||
    Boolean(state.trackViewer.trackGeojson)
  );
}

/**
 * The map the URL names in `id=`: one on its way in, or failing that the one
 * already connected.
 *
 * A map claims the URL as soon as its load or restore starts, so a reload lands
 * back on it rather than on the map being left, and so a second pass over the
 * URL doesn't take it for a new navigation. Which means every one of these has
 * to be released when it ends — including a load that ended in failure, or the
 * `id=` would outlive it.
 */
export function urlMapIdSelector(state: RootState): string | undefined {
  const { loadMeta, restoring, activeMap } = state.myMaps;

  return loadMeta?.id || restoring?.mapId || activeMap?.id;
}

/**
 * Whether a map is on its way in, and so is about to say what the map holds.
 *
 * A document carries its own pinned results, so an element fetch that fails
 * while one is opening is answered by the map itself — offline that is every
 * such fetch, and reporting them would put an error over results that are about
 * to appear.
 */
export function mapOpeningSelector(state: RootState): boolean {
  const { loadMeta, restoring } = state.myMaps;

  return Boolean(loadMeta || restoring);
}

/** Why the active map's queued save was refused, if one was. */
export function activeMapBlockedSelector(
  state: RootState,
): BlockedReason | undefined {
  const { activeMap, outbox } = state.myMaps;

  return activeMap
    ? outbox.find((entry) => entry.mapId === activeMap.id)?.blocked
    : undefined;
}

/**
 * Whether the active map differs from the copy that was last loaded or saved.
 *
 * Derived rather than tracked: there is no flag to keep in step with loads,
 * saves, history navigation, reloads or other tabs — the answer is always a
 * fresh comparison of what's on screen against the stored copy's digest.
 * `fingerprintState` memoizes on the slices it reads, so this stays cheap enough
 * to call on every render.
 */
export function mapDirtySelector(state: RootState): boolean {
  const { activeMap, savedFingerprint, routeRecomputed } = state.myMaps;

  if (activeMap === undefined) {
    return false;
  }

  // A queued save the server refused is durable but going nowhere until the
  // user settles it, so the map still holds changes the saved map doesn't. The
  // digest can't see this: filing the save made the screen match what was
  // filed, which is what says "saved" for one that is merely waiting to be sent.
  if (activeMapBlockedSelector(state) !== undefined) {
    return true;
  }

  return (
    savedFingerprint !== null &&
    // The one change the digest can't see, so it is recorded rather than derived.
    (routeRecomputed || fingerprintState(state) !== savedFingerprint)
  );
}
