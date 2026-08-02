import type { MyStore } from '@app/store/store.js';
import { gpsRecorderSync } from './model/actions.js';
import { isRecorderStreamSuspect, suspectRecorderStream } from './stream.js';
import { gpsRecorderPlatformSupported } from './support.js';

/**
 * Whether the recorder is worth following: it was recording, or holding a track,
 * the last time this browser looked.
 *
 * In `localStorage` rather than in the store, because the question outlives the
 * page — a recording carries on in the phone's own app while the browser is
 * closed, and on the next load nothing else knows there is anything to fetch.
 * Deliberately not in `persistence.ts`: that subset is re-serialized on every
 * action, and this changes when a recording starts or ends.
 */
const KEY = 'fm.gpsRecorder.follow';

export function isRecorderFollowed(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
}

export function setRecorderFollowed(followed: boolean): void {
  try {
    if (followed) {
      localStorage.setItem(KEY, 'true');
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // Storage denied (private mode, a blocked origin); following then lasts only
    // as long as the page does, which is no worse than not trying.
  }
}

/**
 * Keeps the recording on the map for as long as there is one — whether or not the
 * tool's toolbar is open, and across a reload.
 *
 * The connection is deliberately not the toolbar's: neither closing it nor a
 * reload says anything about whether the phone is still recording. This runs at
 * boot and whenever the page comes back to the foreground, which is also when a
 * frozen tab has missed the stream's events.
 *
 * Syncs raised from here are **quiet**: nothing the user did prompted them, so a
 * recorder that has since been killed or uninstalled must not greet them with an
 * error. It stops following instead, and opening the tool is what tries again.
 *
 * Going the other way matters just as much: a page on its way out takes its live
 * stream with it into whatever the browser does next, unobserved, so the stream is
 * marked as not to be believed until it has been replaced.
 */
export function attachRecorderFollow(store: MyStore): void {
  if (!gpsRecorderPlatformSupported) {
    return;
  }

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      suspectRecorderStream();

      return;
    }

    // The tool being open counts as well, so returning to the page with it open
    // catches up even when there is nothing recorded yet — and so does a stream
    // held over from the hidden page, which only a sync replaces.
    if (
      isRecorderFollowed() ||
      store.getState().main.tool === 'gps-recorder' ||
      isRecorderStreamSuspect()
    ) {
      store.dispatch(gpsRecorderSync({ quiet: true }));
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);

  onVisibilityChange();
}
