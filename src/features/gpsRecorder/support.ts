import type { RootState } from '@app/store/store.js';
import { hasRole } from '@features/auth/model/types.js';

/**
 * Android, because the recorder ships as an Android APK and nothing else can
 * reach it. Not narrowed to Chromium: other Android browsers can talk to
 * loopback too, and the pieces that are Chromium-specific — the
 * `targetAddressSpace` hint, the Local Network Access permission — degrade to
 * no-ops rather than errors elsewhere.
 *
 * Tested against the userAgent string rather than `navigator.userAgentData`,
 * which is both Chromium-only and secure-context-only: over plain http on a dev
 * host it is `undefined`, which would hide the tool exactly where it is being
 * developed.
 *
 * A module constant — this cannot change within a page lifetime.
 */
export const gpsRecorderPlatformSupported = /Android/i.test(
  navigator.userAgent,
);

/**
 * Whether the GPS recorder tool is offered. Limited to holders of
 * `layerPreview` while the feature is still being proven, so it can ship to
 * production without being on for everyone.
 */
export function gpsRecorderAvailableSelector(state: RootState): boolean {
  return (
    gpsRecorderPlatformSupported && hasRole(state.auth.user, 'layerPreview')
  );
}
