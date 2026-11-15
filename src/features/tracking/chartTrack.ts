import type { TrackPoint } from './model/types.js';

/** Whether the elevation chart has something to plot. */
export function hasElevation(points: TrackPoint[]): boolean {
  let n = 0;

  for (const p of points) {
    if (
      typeof p.altitude === 'number' &&
      Number.isFinite(p.altitude) &&
      ++n >= 2
    ) {
      return true;
    }
  }

  return false;
}
