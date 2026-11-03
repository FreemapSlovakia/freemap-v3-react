import type { TerrainProgress } from '@shared/terrainService.js';
import { useEffect, useState } from 'react';

/** Milliseconds since the render started, or `0` while none is running. */
function useElapsed(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) {
      setElapsed(0);

      return;
    }

    const started = performance.now();

    const timer = setInterval(
      () => setElapsed(performance.now() - started),
      250,
    );

    return () => clearInterval(timer);
  }, [running]);

  return elapsed;
}

export type TerrainProgressBar = {
  /** The render is waiting its turn; `ahead` says for how many. */
  queued: TerrainProgress | null;
  /** What is happening now, for a caller with somewhere to say it. */
  phase: TerrainProgress['phase'] | null;
  /** How long this has been going. */
  label: string;
};

/**
 * What to say about a terrain render in flight.
 *
 * **A spinner and a phase, not a fraction.** The service counts only its own
 * marching: nothing while it loads the peaks and finds the eye, nothing for the
 * encode, and nothing at all for the transfer and the decode that follow. On a
 * narrow slice the marching is two seconds of a twelve-second wait, so a bar
 * built on it filled and then stood at the end for three times as long, which
 * says less than the elapsed seconds beside it do.
 */
export function useTerrainProgress(
  rendering: boolean,
  progress: TerrainProgress | null,
): TerrainProgressBar {
  const elapsed = useElapsed(rendering);

  return {
    queued: progress?.phase === 'queued' ? progress : null,
    // `done` is the service's last word, not the render's: the body is still
    // arriving and this side has still to unpack it. Read as anything else it
    // flashed the rendering caption again between the encode and the decode.
    phase: progress?.phase === 'done' ? 'decoding' : (progress?.phase ?? null),
    label: `${Math.round(elapsed / 1000)} s`,
  };
}
