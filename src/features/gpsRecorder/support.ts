import { isGeolocationSupported } from '@shared/geolocationWatch.js';

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
 *
 * This is no longer the whole of the tool's availability: the browser backend
 * records without it. It is what decides whether the recorder app is spoken of
 * at all — see {@link gpsRecorderAvailableSelector}.
 */
export const gpsRecorderPlatformSupported = /Android/i.test(
  navigator.userAgent,
);

/**
 * Whether recording from this page's own Geolocation API is worth offering.
 *
 * A coarse pointer stands in for "carried", and it is doing real work rather
 * than being fussy: browser recording needs the page open and the screen awake
 * for the length of a ride, which is a thing a phone in a pocket can do and a
 * desktop browser has no reason to. The tool is otherwise an item in every
 * desktop user's menu that nothing there can use.
 *
 * The same predicate gates `#tools=gps-recorder`, so this hides the tool from a
 * desktop URL as well. Testing it on one means the devtools device emulation,
 * which reports the coarse pointer along with everything else.
 */
export const browserRecordingSupported =
  isGeolocationSupported() &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(any-pointer: coarse)').matches;

/**
 * Whether the GPS recorder tool is offered at all — with the recorder app, with
 * the browser's own geolocation, or both. Marked experimental in the menus
 * rather than hidden behind a role, because the people who would find the rough
 * edges are the people who would use it.
 */
export function gpsRecorderAvailableSelector(): boolean {
  return gpsRecorderPlatformSupported || browserRecordingSupported;
}
