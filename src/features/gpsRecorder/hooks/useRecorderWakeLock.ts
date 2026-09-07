import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';

/**
 * Holds a screen wake lock while a recording is in progress, so a long ride stays
 * visible on the map instead of the platform's own timeout blanking it.
 *
 * Held only while there is something to watch: a stopped recording gives the
 * screen back. Tied to the recording rather than to the recorder's toolbar, which
 * the user may well close while riding.
 */
export function useRecorderWakeLock(): void {
  const keepScreenAwake = useAppSelector(
    (state) => state.gpsRecorderSettings.keepScreenAwake,
  );

  const recording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  useEffect(() => {
    if (!keepScreenAwake || !recording || !('wakeLock' in navigator)) {
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
  }, [keepScreenAwake, recording]);
}
