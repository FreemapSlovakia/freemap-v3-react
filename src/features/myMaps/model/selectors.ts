import type { RootState } from '@app/store/store.js';
import { fingerprintState } from './mapDocument.js';

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
  const { activeMap, savedFingerprint } = state.myMaps;

  return (
    activeMap !== undefined &&
    savedFingerprint !== null &&
    fingerprintState(state) !== savedFingerprint
  );
}
