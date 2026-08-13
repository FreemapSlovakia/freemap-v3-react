import type { RootState } from '@app/store/store.js';
import { fingerprintState } from './mapDocument.js';

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

  return (
    activeMap !== undefined &&
    savedFingerprint !== null &&
    // The one change the digest can't see, so it is recorded rather than derived.
    (routeRecomputed || fingerprintState(state) !== savedFingerprint)
  );
}
