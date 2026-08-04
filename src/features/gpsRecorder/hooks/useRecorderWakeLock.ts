import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';
import { recorderBackendKind } from '../backend.js';

/**
 * Holds a screen wake lock while a recording is in progress, so a long ride stays
 * visible on the map instead of the platform's own timeout blanking it.
 *
 * Held only while there is something to watch: a stopped recording gives the
 * screen back. Tied to the recording rather than to the recorder's toolbar, which
 * the user may well close while riding.
 *
 * `keepScreenAwake` is the preference, and it decides nothing when this page is
 * what records: a blanked screen does not merely hide a browser recording, it
 * ends it. That makes the lock part of recording rather than a way of looking at
 * it, and a preference over it would be one that quietly throws rides away.
 */
export function useRecorderWakeLock(): void {
  const wanted = useAppSelector(
    (state) =>
      state.gpsRecorderSettings.keepScreenAwake ||
      recorderBackendKind(state) === 'browser',
  );

  const recording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  useEffect(() => {
    if (!wanted || !recording || !('wakeLock' in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;

    let released = false;

    navigator.wakeLock
      .request('screen')
      .then((s) => {
        if (released) {
          void s.release();
        } else {
          sentinel = s;
        }
      })
      // Denied (or the tab lost visibility mid-request); the recording is
      // unaffected, so there is nothing to report.
      .catch(() => undefined);

    return () => {
      released = true;

      void sentinel?.release();
    };
  }, [wanted, recording]);
}
