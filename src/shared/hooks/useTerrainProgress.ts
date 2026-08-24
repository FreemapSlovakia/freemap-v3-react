import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { TerrainProgress } from '@shared/terrainService.js';
import { useEffect, useState } from 'react';

const PERCENT_FORMAT = { style: 'percent', maximumFractionDigits: 0 } as const;

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
  /** What a `<ProgressBar>` should be filled to, 0–100. */
  now: number;
  /** The figure written on it: a percentage, or seconds while none is known. */
  label: string;
  /** `<ProgressBar>` variant; grey while queued. */
  variant: 'secondary' | undefined;
};

/**
 * What to draw a terrain render's progress bar from, for whoever is showing it.
 *
 * The service reports its own progress, but only once the request has landed on
 * it and not at all where the side channel can't be opened, so a clock estimate
 * against `expectedMs` stands in until a real figure arrives — and only then is
 * the clock kept running.
 */
export function useTerrainProgress(
  rendering: boolean,
  progress: TerrainProgress | null,
  expectedMs: number,
): TerrainProgressBar {
  const nfPercent = useNumberFormat(PERCENT_FORMAT);

  const queued = progress?.phase === 'queued' ? progress : null;

  // Only the rendering phase counts anything; the ones after it carry no figure
  // and would otherwise drop a nearly full bar back to zero.
  const percent =
    !progress || queued
      ? null
      : progress.phase === 'rendering'
        ? progress.percent
        : 100;

  const elapsed = useElapsed(rendering && percent === null);

  return {
    queued,
    // Full and grey while queued: there is nothing to be a fraction of until
    // the render starts.
    now: queued ? 100 : (percent ?? Math.min(99, (elapsed / expectedMs) * 100)),
    label:
      percent === null
        ? `${Math.round(elapsed / 1000)} s`
        : nfPercent.format(percent / 100),
    variant: queued ? 'secondary' : undefined,
  };
}
